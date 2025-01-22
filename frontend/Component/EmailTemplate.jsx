import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '../Component/logo ball.jpg'
import '../Component/Styles.css';

const EmailTemplate = () => {
    const [title, setTitle] = useState("Email has never been easier");
    const [content, setContent] = useState(
      "Create beautiful and sophisticated emails in minutes. No coding required, and minimal setup. The way email should be."
    );
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
  
    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setImage(file);
        setImageUrl(url);
      }
    };

    const handleSubmit = async () => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image) {
        formData.append("image", image);
      }
  
      try {
        const response = await axios.post("http://localhost:5000/api/templates", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Template saved successfully!");
        console.log(response.data);
      } catch (error) {
        console.error("Error saving template:", error);
      }
    };

    const handleDownload = async () => {
        try {
          const response = await axios.post(
            'http://localhost:5000/api/templates/render',
            { title, content, imageUrl },
            {
              responseType: "blob", // Important for downloading files
            }
          );
      
          // Create a download link
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "template.html");
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
        } catch (error) {
          console.error("Error downloading template:", error);
        }
      };
  
    return (
      <div className="email-template">
       <img src={logo} style={{width:"6vw", height:"5vw"}}/>
  
        <div
          className="title"
          contentEditable
          onBlur={(e) => setTitle(e.target.innerText)}
        >
          {title}
        </div>
  
        <div
          className="content"
          contentEditable
          onBlur={(e) => setContent(e.target.innerText)}
        >
          {content}
        </div>
  
        <div className="actions">
          <button className="get-started">Get started</button>
          <button className="learn-more">Learn more</button>
        </div>
  
        <div className="image-preview">
          {imageUrl ? (
            <img src={imageUrl} alt="Uploaded Preview" />
          ) : (
            <input type="file" accept="image/*" onChange={handleImageChange} />
          )}
        </div>
  
        <button className="save-button" onClick={handleSubmit} style={{background:"skyblue",  height:"26px", borderRadius:"12px"}}>
          Save Template</button>
        <button className="download-button" onClick={handleDownload} style={{background:"skyblue", height:"26px", borderRadius:"12px", marginLeft:"40px"}}>Download Template </button>
                      
      </div>
    );
  };
  
  export default EmailTemplate;
