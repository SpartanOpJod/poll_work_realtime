import { model, models, Schema, type InferSchemaType } from 'mongoose';

const pollOptionSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true
    },
    votes: {
      type: Number,
      required: true,
      default: 0
    }
  },
  { _id: false }
);

const pollSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true
    },
    options: {
      type: [pollOptionSchema],
      required: true,
      validate: {
        validator: (opts: unknown[]) => Array.isArray(opts) && opts.length >= 2,
        message: 'A poll needs at least 2 options.'
      }
    },
    voters: {
      type: [String],
      default: []
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

export type PollDocument = InferSchemaType<typeof pollSchema> & { _id: { toString(): string } };

const Poll = models.Poll || model('Poll', pollSchema);

export default Poll;
