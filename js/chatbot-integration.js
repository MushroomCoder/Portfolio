// chatbot-integration.js

// Import the ChatbotUI class
import ChatbotUI from './chatbot-ui.js';

// Initialize the chatbot when the page is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create a delay to ensure the website loads completely first
  setTimeout(() => {
    // Initialize the chatbot with the path to your QA data
    const chatbotUI = new ChatbotUI('./data/qa-data.json');
    
    // You can customize the chatbot's appearance or behavior here if needed
    console.log('AI Chatbot initialized and ready to assist visitors');
  }, 2000); // 2-second delay to allow the main site content to load first
});