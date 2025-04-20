// app/api/members/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import Member from '@/models/member';
import connectToDatabase from '@/lib/db';
import { generateMemberId } from '@/lib/utils';
import mongoose from 'mongoose';

// GET all members with pagination and filtering
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const clusterId = searchParams.get('clusterId') || '';
    const smallGroupId = searchParams.get('smallGroupId') || '';
    const gender = searchParams.get('gender') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    interface MemberQueryType {
      $or?: Array<{[key: string]: {$regex: string, $options: string}}>;
      status?: string;
      clusterId?: string;
      smallGroupId?: string;
      gender?: string;
    }
    
    const query: MemberQueryType = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (clusterId) {
      query.clusterId = clusterId;
    }
    
    if (smallGroupId) {
      query.smallGroupId = smallGroupId;
    }
    
    if (gender) {
      query.gender = gender;
    }

    // Connect to database
    await connectToDatabase();
    
    // Get total count
    const total = await Member.countDocuments(query);
    
    // Get paginated results
    interface SortType {
      [key: string]: number;
    }
    const sort: SortType = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const skip = (page - 1) * limit;
    
    const members = await Member.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('clusterId', 'name')
      .populate('smallGroupId', 'name')
      .lean();
    
    return NextResponse.json({
      success: true,
      data: {
        members,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get members error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching members' },
      { status: 500 }
    );
  }
}

// POST create new member
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse request body
    const memberData = await req.json();
    
    // Connect to database
    await connectToDatabase();
    
    // Validate essential member data
    if (!memberData.firstName || !memberData.lastName || !memberData.gender || !memberData.maritalStatus) {
      return NextResponse.json(
        { success: false, message: 'Required fields are missing (firstName, lastName, gender, maritalStatus)' },
        { status: 400 }
      );
    }
    
    // Validate address data
    if (!memberData.address || !memberData.address.street || !memberData.address.city || 
        !memberData.address.state || !memberData.address.country) {
      return NextResponse.json(
        { success: false, message: 'Address fields are required (street, city, state, country)' },
        { status: 400 }
      );
    }
    
    // Check if member with same email already exists
    if (memberData.email) {
      const existingMember = await Member.findOne({ email: memberData.email });
      if (existingMember) {
        return NextResponse.json(
          { success: false, message: 'Member with this email already exists' },
          { status: 400 }
        );
      }
    }
    
    // Check if member with same phone already exists
    if (memberData.phoneNumber) {
      const existingMember = await Member.findOne({ phoneNumber: memberData.phoneNumber });
      if (existingMember) {
        return NextResponse.json(
          { success: false, message: 'Member with this phone number already exists' },
          { status: 400 }
        );
      }
    }
    
    // Generate a unique member ID
    const memberCount = await Member.countDocuments();
    const memberId = generateMemberId(memberData.firstName, memberData.lastName, memberCount + 1);
    
    // Get the userId from token and convert to ObjectId
    const userId = token.id;
    
    // Create new member with required server-side fields
    const newMember = new Member({
      ...memberData,
      memberId,
      // Set to null explicitly for ObjectID fields (if they're empty strings)
      clusterId: memberData.clusterId && memberData.clusterId !== "" ? memberData.clusterId : null,
      smallGroupId: memberData.smallGroupId && memberData.smallGroupId !== "" ? memberData.smallGroupId : null,
      // Set required fields - explicitly using userId
      createdBy: userId,
      lastUpdatedBy: userId,
      // Initialize with empty arrays/objects
      teams: [],
      skills: [],
      training: [],
      spiritualGrowth: {}
    });
    
    await newMember.save();
    
    return NextResponse.json({
      success: true,
      message: 'Member created successfully',
      data: newMember
    });
  } catch (error) {
    console.error('Create member error:', error);
    // Return more detailed error information for debugging
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error creating member',
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// PUT update member
export async function PUT(req: NextRequest) {
  try {
    // Verify authentication
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, message: 'Member ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Check if member exists
    const existingMember = await Member.findById(body.id);
    if (!existingMember) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }
    
    // Remove id from update data - we don't want to update the ID
    const { id, ...updateData } = body;
    
    // Check if email is being updated and is already in use
    if (updateData.email && updateData.email !== existingMember.email) {
      const emailExists = await Member.findOne({ 
        email: updateData.email,
        _id: { $ne: body.id }
      });
      
      if (emailExists) {
        return NextResponse.json(
          { success: false, message: 'Email is already in use by another member' },
          { status: 400 }
        );
      }
    }
    
    // Check if phone is being updated and is already in use
    if (updateData.phoneNumber && updateData.phoneNumber !== existingMember.phoneNumber) {
      const phoneExists = await Member.findOne({ 
        phoneNumber: updateData.phoneNumber,
        _id: { $ne: body.id }
      });
      
      if (phoneExists) {
        return NextResponse.json(
          { success: false, message: 'Phone number is already in use by another member' },
          { status: 400 }
        );
      }
    }
    
    // Get the userId from token
    const userId = token.id;
    
    // Record who last updated this member
    updateData.lastUpdatedBy = userId;
    
    // Update member
    const updatedMember = await Member.findByIdAndUpdate(
      body.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Member updated successfully',
      data: updatedMember
    });
  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error updating member',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE a member
export async function DELETE(req: NextRequest) {
  try {
    // Verify authentication
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Only Admin and Pastor roles can delete members
    if (token.role !== 'Admin' && token.role !== 'Pastor') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete members' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Member ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Delete member
    const deletedMember = await Member.findByIdAndDelete(id);
    
    if (!deletedMember) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error) {
    console.error('Delete member error:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting member' },
      { status: 500 }
    );
  }
}