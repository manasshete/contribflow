import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';
import { RepositoryModel } from '../models/Repository.model';
import { RepositoryAnalysisModel } from '../models/RepositoryAnalysis.model';
import { IssueModel } from '../models/Issue.model';
import { ConversationModel } from '../models/Conversation.model';
import { generateChatReply } from '../services/chat/chat.service';

const chatRequestSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  issueNumber: z.number().int().positive(),
  sessionId: z.string().min(1),
  message: z.string().min(1).max(2000),
});

export async function postChatMessageHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = chatRequestSchema.parse(req.body);

    const repoDoc = await RepositoryModel.findOne({ owner: body.owner, repo: body.repo });
    if (!repoDoc) {
      throw new AppError(`Repository ${body.owner}/${body.repo} has not been analyzed yet.`, 404);
    }

    const issueDoc = await IssueModel.findOne({ repositoryId: repoDoc._id, issueNumber: body.issueNumber });
    if (!issueDoc) {
      throw new AppError(`Issue #${body.issueNumber} not found for ${body.owner}/${body.repo}.`, 404);
    }

    const analysisDoc = await RepositoryAnalysisModel.findOne({ repositoryId: repoDoc._id }).sort({ cachedAt: -1 });

    const relevantFiles =
      issueDoc.contributionPlan?.relevantFiles.map((f) => f.path) ?? issueDoc.analysis?.likelyAffectedAreas ?? [];

    const context = {
      repoSummary: analysisDoc?.summary ?? `${body.owner}/${body.repo}`,
      issueTitle: issueDoc.title,
      relevantFiles,
      architecture: analysisDoc?.architecture.type ?? 'unknown',
    };

    let conversation = await ConversationModel.findOne({
      sessionId: body.sessionId,
      repositoryId: repoDoc._id,
      issueNumber: body.issueNumber,
    });

    if (!conversation) {
      conversation = new ConversationModel({
        sessionId: body.sessionId,
        repositoryId: repoDoc._id,
        issueNumber: body.issueNumber,
        messages: [],
        context,
      });
    }

    conversation.messages.push({ role: 'user', content: body.message, timestamp: new Date() });

    const reply = await generateChatReply(context, conversation.messages, body.message);

    conversation.messages.push({ role: 'assistant', content: reply, timestamp: new Date() });
    conversation.context = context;
    conversation.updatedAt = new Date();
    await conversation.save();

    return res.json({ sessionId: body.sessionId, reply, messages: conversation.messages });
  } catch (err) {
    return next(err);
  }
}

export async function getConversationHandler(
  req: Request<{ owner: string; repo: string; issueNumber: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { owner, repo, issueNumber } = req.params;
    const sessionId = req.query.sessionId;
    if (typeof sessionId !== 'string' || sessionId.length === 0) {
      throw new AppError('sessionId query parameter is required', 400);
    }

    const repoDoc = await RepositoryModel.findOne({ owner, repo });
    if (!repoDoc) {
      return res.json({ messages: [] });
    }

    const conversation = await ConversationModel.findOne({
      sessionId,
      repositoryId: repoDoc._id,
      issueNumber: Number(issueNumber),
    });

    return res.json({ messages: conversation?.messages ?? [] });
  } catch (err) {
    return next(err);
  }
}
