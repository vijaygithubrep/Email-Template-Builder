const express = require("express");
const multer = require("multer");
const fs = require("fs");
const ejs = require("ejs");
const mongoose = require("mongoose");
require('dotenv').config()
const path = require("path");
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Setup multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// MongoDB Schema
mongoose.connect(process.env.MONGO_URL , {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

const templateSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    footer: { type: String },
    imageUrl: { type: String },
});

const Template = mongoose.model("Template", templateSchema);

// GET email layout
app.get("/getEmailLayout", (req, res) => {
    res.sendFile(path.resolve("views/layout.ejs"));
});

// POST upload image
app.post("/uploadImage", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

// POST save template
app.post("/saveTemplate", async (req, res) => {
    try {
        const { title, content, footer, imageUrl } = req.body;
        const template = new EmailTemplate({ title, content, footer, imageUrl });
        await template.save();
        res.status(201).json({ message: "Template saved successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error saving template" });
    }
});

// Save the template configuration
app.post("/uploadEmailConfig", async (req, res) => {
    const template = new Template(req.body);
    await template.save();
    res.sendStatus(200);
});

// GET render template
app.get("/renderTemplate/:id", async (req, res) => {
    try {
        const template = await EmailTemplate.findById(req.params.id);
        if (!template) return res.status(404).json({ error: "Template not found" });

        res.render("layout", {
            title: template.title,
            content: template.content,
            footer: template.footer,
            imageUrl: template.imageUrl,
        });
    } catch (error) {
        res.status(500).json({ error: "Error rendering template" });
    }
});


app.post("/api/templates/render", async (req, res) => {
    try {
      const { title, content, imageUrl } = req.body;
      const html = await ejs.renderFile(path.join(__dirname, "layout.html"), {
        title,
        content,
        imageUrl: imageUrl ? `http://localhost:5000${imageUrl}` : null,
      });

      const outputPath = path.join(__dirname, "output.html");
      fs.writeFileSync(outputPath, html);
      res.download(outputPath, "template.html", (err) => {
        if (err) {
          console.error("Error sending file:", err);
        }
        fs.unlinkSync(outputPath); 
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to render template" });
    }
  });

app.get("/api/templates", async (req, res) => {
    try {
      const templates = await Template.find();
      res.json(templates);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });
  
  app.post("/api/templates", upload.single("image"), async (req, res) => {
    try {
      const { title, content } = req.body;
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  
      const newTemplate = new Template({ title, content, imageUrl });
      await newTemplate.save();
  
      res.status(201).json(newTemplate);
    } catch (err) {
      res.status(500).json({ message: "Failed to save template" });
    }
  });


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    });
