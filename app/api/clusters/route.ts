import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import Cluster from '@/models/cluster';
import connectToDatabase from '@/lib/db';

// GET all clusters with pagination and filtering
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
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Connect to database
    await connectToDatabase();
    
    // Get total count
    const total = await Cluster.countDocuments(query);
    
    // Get paginated results
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const skip = (page - 1) * limit;
    
    const clusters = await Cluster.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('leader', 'firstName lastName email')
      .lean();
    
    return NextResponse.json({
      success: true,
      data: {
        clusters,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get clusters error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching clusters' },
      { status: 500 }
    );
  }
}

// POST create new cluster
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

    // Check if user has admin or pastor role
    if (token.role !== 'Admin' && token.role !== 'Pastor') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to create clusters' },
        { status: 403 }
      );
    }

    // Parse request body
    const clusterData = await req.json();
    
    // Connect to database
    await connectToDatabase();
    
    // Validate cluster data
    if (!clusterData.name) {
      return NextResponse.json(
        { success: false, message: 'Cluster name is required' },
        { status: 400 }
      );
    }
    
    // Check if cluster with same name already exists
    const existingCluster = await Cluster.findOne({ name: clusterData.name });
    if (existingCluster) {
      return NextResponse.json(
        { success: false, message: 'Cluster with this name already exists' },
        { status: 400 }
      );
    }
    
    // Create new cluster
    const newCluster = new Cluster(clusterData);
    await newCluster.save();
    
    // Populate leader details
    if (newCluster.leader) {
      await newCluster.populate('leader', 'firstName lastName email');
    }
    
    return NextResponse.json({
      success: true,
      data: newCluster
    });
  } catch (error) {
    console.error('Create cluster error:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating cluster' },
      { status: 500 }
    );
  }
}
