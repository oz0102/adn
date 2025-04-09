import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  reportType: string;
  title: string;
  description: string;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  data: any;
  generatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const DateRangeSchema = new Schema({
  startDate: { 
    type: Date, 
    required: true
  },
  endDate: { 
    type: Date, 
    required: true
  }
});

const ReportSchema: Schema = new Schema(
  {
    reportType: { 
      type: String, 
      required: true,
      enum: ['Membership Growth', 'Attendance Trends', 'Cluster Performance', 'Small Group Performance', 'Spiritual Growth', 'Other']
    },
    title: { 
      type: String, 
      required: true,
      trim: true
    },
    description: { 
      type: String, 
      required: true
    },
    dateRange: { 
      type: DateRangeSchema,
      required: true
    },
    data: { 
      type: Schema.Types.Mixed, 
      required: true
    },
    generatedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    }
  },
  { 
    timestamps: { createdAt: true, updatedAt: false } 
  }
);

export default mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
