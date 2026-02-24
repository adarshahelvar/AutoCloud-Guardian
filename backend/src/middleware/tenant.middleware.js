// A user can only access resources belonging to their organization.
export const requireOrganization = (req, res, next) => {
  if (!req.user.organizationId) {
    return res.status(403).json({
      message: "User is not associated with any organization",
    });
  }

  next();
};


