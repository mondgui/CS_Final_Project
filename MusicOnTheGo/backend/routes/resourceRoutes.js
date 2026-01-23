// backend/routes/resourceRoutes.js - Converted to use Prisma
import express from "express";
import prisma from "../utils/prisma.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * GET /api/resources
 * Get all resources (for students) or filtered resources
 */
router.get("/", async (req, res) => {
  try {
    const { instrument, level, category } = req.query;
    
    const where = {};
    if (instrument) where.instrument = instrument;
    if (level) where.level = level;
    if (category) where.category = category;
    
    const resources = await prisma.resource.findMany({
      where,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    res.json(resources);
  } catch (err) {
    console.error("[Resources] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/resources/me
 * TEACHER: Get all resources uploaded by the current teacher
 */
router.get(
  "/me",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const resources = await prisma.resource.findMany({
        where: { uploadedById: req.user.id },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      
      res.json(resources);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * POST /api/resources
 * TEACHER: Create a new resource
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        fileUrl,
        externalUrl,
        fileName,
        fileType,
        fileSize,
        instrument,
        level,
        category,
      } = req.body;

      if (!title || !fileType || !instrument || !level) {
        return res.status(400).json({
          message: "Title, fileType, instrument, and level are required.",
        });
      }

      if (!fileUrl && !externalUrl) {
        return res.status(400).json({
          message: "Either fileUrl or externalUrl must be provided.",
        });
      }

      const resource = await prisma.resource.create({
        data: {
          title,
          description: description || "",
          fileUrl: fileUrl || "",
          externalUrl: externalUrl || "",
          fileName: fileName || "",
          fileType,
          fileSize: fileSize || 0,
          instrument,
          level,
          category: category || "",
          uploadedById: req.user.id,
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
      });
      
      res.status(201).json(resource);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * PUT /api/resources/:id
 * TEACHER: Update a resource
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const resource = await prisma.resource.findUnique({
        where: { id: req.params.id },
      });

      if (!resource) {
        return res.status(404).json({ message: "Resource not found." });
      }

      if (resource.uploadedById !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      const {
        title,
        description,
        fileUrl,
        externalUrl,
        fileType,
        fileSize,
        instrument,
        level,
        category,
      } = req.body;

      const updateData = {};
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (fileUrl !== undefined) updateData.fileUrl = fileUrl;
      if (externalUrl !== undefined) updateData.externalUrl = externalUrl;
      if (fileType) updateData.fileType = fileType;
      if (fileSize !== undefined) updateData.fileSize = fileSize;
      if (instrument) updateData.instrument = instrument;
      if (level) updateData.level = level;
      if (category !== undefined) updateData.category = category;

      const updatedResource = await prisma.resource.update({
        where: { id: req.params.id },
        data: updateData,
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
      });
      
      res.json(updatedResource);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * DELETE /api/resources/:id
 * TEACHER: Delete a resource
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const resource = await prisma.resource.findUnique({
        where: { id: req.params.id },
      });

      if (!resource) {
        return res.status(404).json({ message: "Resource not found." });
      }

      if (resource.uploadedById !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      await prisma.resource.delete({
        where: { id: req.params.id },
      });

      res.json({ message: "Resource deleted successfully." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * POST /api/resources/:id/assign
 * TEACHER: Assign a resource to students with optional notes
 */
router.post(
  "/:id/assign",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const { studentIds, notes } = req.body;

      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({
          message: "studentIds array is required and must not be empty.",
        });
      }

      const resource = await prisma.resource.findUnique({
        where: { id: req.params.id },
        include: { assignedTo: true },
      });

      if (!resource) {
        return res.status(404).json({ message: "Resource not found." });
      }

      if (resource.uploadedById !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      // Get existing assigned student IDs
      const existingIds = resource.assignedTo.map(u => u.id);
      const newIds = studentIds.filter(id => !existingIds.includes(id));

      // Connect new students to the resource (many-to-many)
      if (newIds.length > 0) {
        await prisma.resource.update({
          where: { id: req.params.id },
          data: {
            assignedTo: {
              connect: newIds.map(id => ({ id })),
            },
          },
        });
      }

      // Create or update ResourceAssignment records with notes
      const assignmentPromises = studentIds.map(async (studentId) => {
        const note = notes && notes[studentId] ? notes[studentId] : "";
        
        return prisma.resourceAssignment.upsert({
          where: {
            resourceId_studentId: {
              resourceId: req.params.id,
              studentId,
            },
          },
          update: {
            note,
            teacherId: req.user.id,
          },
          create: {
            resourceId: req.params.id,
            studentId,
            teacherId: req.user.id,
            note,
          },
        });
      });

      await Promise.all(assignmentPromises);

      const updatedResource = await prisma.resource.findUnique({
        where: { id: req.params.id },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      res.json(updatedResource);
    } catch (err) {
      console.error("[Resources] Assignment error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * DELETE /api/resources/:id/assign/:studentId
 * TEACHER: Unassign a resource from a student
 */
router.delete(
  "/:id/assign/:studentId",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const resource = await prisma.resource.findUnique({
        where: { id: req.params.id },
      });

      if (!resource) {
        return res.status(404).json({ message: "Resource not found." });
      }

      if (resource.uploadedById !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      // Disconnect student from resource
      await prisma.resource.update({
        where: { id: req.params.id },
        data: {
          assignedTo: {
            disconnect: { id: req.params.studentId },
          },
        },
      });

      // Delete the ResourceAssignment record
      await prisma.resourceAssignment.deleteMany({
        where: {
          resourceId: req.params.id,
          studentId: req.params.studentId,
        },
      });

      const updatedResource = await prisma.resource.findUnique({
        where: { id: req.params.id },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      res.json(updatedResource);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/resources/assigned
 * STUDENT: Get all resources assigned to the current student with notes
 */
router.get(
  "/assigned",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const resources = await prisma.resource.findMany({
        where: {
          assignedTo: {
            some: { id: req.user.id },
          },
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Get assignment notes for each resource
      const resourcesWithNotes = await Promise.all(
        resources.map(async (resource) => {
          const assignment = await prisma.resourceAssignment.findUnique({
            where: {
              resourceId_studentId: {
                resourceId: resource.id,
                studentId: req.user.id,
              },
            },
            include: {
              teacher: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true,
                },
              },
            },
          });

          return {
            ...resource,
            assignmentNote: assignment ? assignment.note : "",
            assignmentTeacher: assignment ? assignment.teacher : null,
            assignmentUpdatedAt: assignment ? assignment.updatedAt : null,
          };
        })
      );

      res.json(resourcesWithNotes);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/resources/assignments
 * TEACHER: Get all resources that have been assigned to students with notes
 */
router.get(
  "/assignments",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      // Get resources with assignments
      const assignments = await prisma.resourceAssignment.findMany({
        where: { teacherId: req.user.id },
        include: {
          resource: {
            include: {
              uploadedBy: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true,
                },
              },
              assignedTo: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImage: true,
                },
              },
            },
          },
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
        },
      });

      // Group by resource
      const resourceMap = new Map();
      assignments.forEach((assignment) => {
        const resourceId = assignment.resourceId;
        if (!resourceMap.has(resourceId)) {
          resourceMap.set(resourceId, {
            ...assignment.resource,
            assignments: [],
          });
        }
        resourceMap.get(resourceId).assignments.push({
          student: assignment.student,
          note: assignment.note,
          updatedAt: assignment.updatedAt,
          createdAt: assignment.createdAt,
        });
      });

      const resourcesWithNotes = Array.from(resourceMap.values());

      res.json(resourcesWithNotes);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * PUT /api/resources/:id/assign/:studentId/note
 * TEACHER: Update the note for a specific assignment
 */
router.put(
  "/:id/assign/:studentId/note",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const { note } = req.body;

      const resource = await prisma.resource.findUnique({
        where: { id: req.params.id },
      });

      if (!resource) {
        return res.status(404).json({ message: "Resource not found." });
      }

      if (resource.uploadedById !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      const assignment = await prisma.resourceAssignment.upsert({
        where: {
          resourceId_studentId: {
            resourceId: req.params.id,
            studentId: req.params.studentId,
          },
        },
        update: {
          note: note || "",
        },
        create: {
          resourceId: req.params.id,
          studentId: req.params.studentId,
          teacherId: req.user.id,
          note: note || "",
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
        },
      });

      res.json(assignment);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * DELETE /api/resources/:id/assign/:studentId/note
 * TEACHER: Delete the note for a specific assignment
 */
router.delete(
  "/:id/assign/:studentId/note",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const resource = await prisma.resource.findUnique({
        where: { id: req.params.id },
      });

      if (!resource) {
        return res.status(404).json({ message: "Resource not found." });
      }

      if (resource.uploadedById !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      const assignment = await prisma.resourceAssignment.update({
        where: {
          resourceId_studentId: {
            resourceId: req.params.id,
            studentId: req.params.studentId,
          },
        },
        data: {
          note: "",
        },
      });

      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found." });
      }

      res.json({ message: "Note deleted successfully.", assignment });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * POST /api/resources/personal
 * STUDENT: Create a personal file/resource
 */
router.post(
  "/personal",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        fileUrl,
        externalUrl,
        fileType,
        fileSize,
        instrument,
        level,
        category,
      } = req.body;

      if (!title || !fileType) {
        return res.status(400).json({
          message: "Title and fileType are required.",
        });
      }

      if (!fileUrl && !externalUrl) {
        return res.status(400).json({
          message: "Either fileUrl or externalUrl must be provided.",
        });
      }

      const resource = await prisma.resource.create({
        data: {
          title,
          description: description || "",
          fileUrl: fileUrl || "",
          externalUrl: externalUrl || "",
          fileType,
          fileSize: fileSize || 0,
          instrument: instrument || "Other",
          level: level || "Beginner",
          category: category || "",
          uploadedById: req.user.id,
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
      });

      res.status(201).json(resource);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/resources/personal
 * STUDENT: Get all personal files/resources uploaded by the student
 */
router.get(
  "/personal",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const resources = await prisma.resource.findMany({
        where: { uploadedById: req.user.id },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(resources);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * DELETE /api/resources/personal/:id
 * STUDENT: Delete a personal file/resource
 */
router.delete(
  "/personal/:id",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const resource = await prisma.resource.findUnique({
        where: { id: req.params.id },
      });

      if (!resource) {
        return res.status(404).json({ message: "Resource not found." });
      }

      if (resource.uploadedById !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      await prisma.resource.delete({
        where: { id: req.params.id },
      });

      res.json({ message: "File deleted successfully." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
