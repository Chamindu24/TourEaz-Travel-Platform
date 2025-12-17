const CategoryApprovalRequest = require('../models/CategoryApprovalRequest');
const ServiceProvider = require('../models/ServiceProvider');
const User = require('../models/User');

// Service Provider creates a new category approval request
exports.createApprovalRequest = async (req, res) => {
  try {
    const { 
      category, 
      documents, 
      companyName, 
      businessRegistration, 
      categoryDescription,
      experience 
    } = req.body;

    // Get the service provider profile
    const user = await User.findById(req.user.userId);
    if (!user || !user.serviceProvider) {
      return res.status(404).json({ msg: 'Service provider profile not found' });
    }

    const serviceProvider = await ServiceProvider.findById(user.serviceProvider);
    if (!serviceProvider) {
      return res.status(404).json({ msg: 'Service provider not found' });
    }

    // Check if there's already a pending request for this category
    const existingRequest = await CategoryApprovalRequest.findOne({
      serviceProvider: serviceProvider._id,
      category,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ 
        msg: 'You already have a pending approval request for this category' 
      });
    }

    // Create new approval request
    const approvalRequest = new CategoryApprovalRequest({
      serviceProvider: serviceProvider._id,
      user: req.user.userId,
      category,
      documents: documents || [],
      companyName: companyName || serviceProvider.companyName,
      businessRegistration: businessRegistration || serviceProvider.businessRegistration,
      categoryDescription,
      experience,
      status: 'pending'
    });

    await approvalRequest.save();

    // Add to service provider's services if not already there
    if (!serviceProvider.services.includes(category)) {
      serviceProvider.services.push(category);
    }

    // Add to serviceApprovals if not already there
    const approvalExists = serviceProvider.serviceApprovals.find(
      a => a.service === category
    );
    
    if (!approvalExists) {
      serviceProvider.serviceApprovals.push({
        service: category,
        isApproved: false,
        requestedDate: new Date()
      });
    }

    await serviceProvider.save();

    res.status(201).json({
      msg: 'Approval request submitted successfully',
      request: approvalRequest
    });
  } catch (err) {
    console.error('Create approval request error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Service Provider gets their own approval requests
exports.getMyApprovalRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.serviceProvider) {
      return res.status(404).json({ msg: 'Service provider profile not found' });
    }

    const requests = await CategoryApprovalRequest.find({
      serviceProvider: user.serviceProvider
    })
    .populate('reviewedBy', 'firstName lastName email')
    .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error('Get my approval requests error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Service Provider gets a specific approval request
exports.getApprovalRequestById = async (req, res) => {
  try {
    const request = await CategoryApprovalRequest.findById(req.params.id)
      .populate('serviceProvider')
      .populate('user', 'firstName lastName email phoneNumber')
      .populate('reviewedBy', 'firstName lastName email');

    if (!request) {
      return res.status(404).json({ msg: 'Approval request not found' });
    }

    // Check authorization (handle populated refs safely)
    const user = await User.findById(req.user.userId);

    const toIdString = (val) => {
      if (!val) return undefined;
      if (typeof val === 'string') return val;
      if (val._id) return val._id.toString();
      if (typeof val.toString === 'function') return val.toString();
      return undefined;
    };

    const requestUserId = toIdString(request.user);
    const requestServiceProviderId = toIdString(request.serviceProvider);
    const currentUserServiceProviderId = toIdString(user && user.serviceProvider);

    const isOwner = requestUserId === req.user.userId;
    const isServiceProviderOwner =
      !!currentUserServiceProviderId &&
      !!requestServiceProviderId &&
      currentUserServiceProviderId === requestServiceProviderId;
    const isAdmin = user && user.role === 'admin';

    if (!isOwner && !isServiceProviderOwner && !isAdmin) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    res.json(request);
  } catch (err) {
    console.error('Get approval request error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Service Provider updates/resubmits an approval request
exports.updateApprovalRequest = async (req, res) => {
  try {
    const { 
      documents, 
      categoryDescription, 
      experience,
      notes 
    } = req.body;

    const request = await CategoryApprovalRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ msg: 'Approval request not found' });
    }

    // Check authorization
    if (request.user.toString() !== req.user.userId) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    // Only allow updates if status is pending or resubmission-required
    if (!['pending', 'resubmission-required'].includes(request.status)) {
      return res.status(400).json({ 
        msg: 'Cannot update request in current status' 
      });
    }

    // If resubmitting, add to resubmissions history
    if (request.status === 'resubmission-required') {
      request.resubmissions.push({
        submittedAt: new Date(),
        documents: documents || request.documents,
        notes: notes || ''
      });
      request.status = 'pending';
    }

    // Update fields
    if (documents) request.documents = documents;
    if (categoryDescription) request.categoryDescription = categoryDescription;
    if (experience) request.experience = experience;

    await request.save();

    res.json({
      msg: 'Approval request updated successfully',
      request
    });
  } catch (err) {
    console.error('Update approval request error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Admin: Get all approval requests (with filters)
exports.getAllApprovalRequests = async (req, res) => {
  try {
    const { status, category } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const requests = await CategoryApprovalRequest.find(filter)
      .populate('serviceProvider')
      .populate('user', 'firstName lastName email phoneNumber')
      .populate('reviewedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error('Get all approval requests error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Admin: Get pending approval requests
exports.getPendingApprovalRequests = async (req, res) => {
  try {
    const requests = await CategoryApprovalRequest.find({ status: 'pending' })
      .populate('serviceProvider')
      .populate('user', 'firstName lastName email phoneNumber')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error('Get pending approval requests error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Admin: Approve a category request
exports.approveRequest = async (req, res) => {
  try {
    const { adminNotes } = req.body;

    const request = await CategoryApprovalRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ msg: 'Approval request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        msg: 'Can only approve pending requests' 
      });
    }

    // Update request
    request.status = 'approved';
    request.reviewedBy = req.user.userId;
    request.reviewedAt = new Date();
    if (adminNotes) request.adminNotes = adminNotes;

    await request.save();

    // Update service provider's approval status for this category
    const serviceProvider = await ServiceProvider.findById(request.serviceProvider);
    if (serviceProvider) {
      const approval = serviceProvider.serviceApprovals.find(
        a => a.service === request.category
      );
      
      if (approval) {
        approval.isApproved = true;
        approval.approvedBy = req.user.userId;
        approval.approvalDate = new Date();
        await serviceProvider.save();
      }
    }

    res.json({
      msg: 'Approval request approved successfully',
      request
    });
  } catch (err) {
    console.error('Approve request error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Admin: Reject a category request
exports.rejectRequest = async (req, res) => {
  try {
    const { rejectionReason, adminNotes } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ msg: 'Rejection reason is required' });
    }

    const request = await CategoryApprovalRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ msg: 'Approval request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        msg: 'Can only reject pending requests' 
      });
    }

    // Update request
    request.status = 'rejected';
    request.reviewedBy = req.user.userId;
    request.reviewedAt = new Date();
    request.rejectionReason = rejectionReason;
    if (adminNotes) request.adminNotes = adminNotes;

    await request.save();

    res.json({
      msg: 'Approval request rejected',
      request
    });
  } catch (err) {
    console.error('Reject request error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Admin: Request resubmission
exports.requestResubmission = async (req, res) => {
  try {
    const { rejectionReason, adminNotes } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ msg: 'Reason for resubmission is required' });
    }

    const request = await CategoryApprovalRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ msg: 'Approval request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        msg: 'Can only request resubmission for pending requests' 
      });
    }

    // Update request
    request.status = 'resubmission-required';
    request.reviewedBy = req.user.userId;
    request.reviewedAt = new Date();
    request.rejectionReason = rejectionReason;
    if (adminNotes) request.adminNotes = adminNotes;

    await request.save();

    res.json({
      msg: 'Resubmission requested',
      request
    });
  } catch (err) {
    console.error('Request resubmission error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Admin: Delete an approval request
exports.deleteApprovalRequest = async (req, res) => {
  try {
    const request = await CategoryApprovalRequest.findByIdAndDelete(req.params.id);
    
    if (!request) {
      return res.status(404).json({ msg: 'Approval request not found' });
    }

    res.json({ msg: 'Approval request deleted successfully' });
  } catch (err) {
    console.error('Delete approval request error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
