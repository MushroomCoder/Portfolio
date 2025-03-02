// chatbot-ui.js
import PortfolioChatbot from './chatbot.js';

class ChatbotUI {
  constructor(qaDataPath) {
    this.qaDataPath = qaDataPath;
    this.chatbot = null;
    this.isOpen = false;
    this.isInitialized = false;
    this.messageQueue = [];
    
    // Create UI elements
    this.createUI();
    
    // Load data and initialize chatbot
    this.initializeChatbot();
  }
  
  async initializeChatbot() {
    try {
      // Load QA data from JSON file
      const response = await fetch(this.qaDataPath);
      const qaData = await response.json();
      
      // Initialize chatbot
      this.chatbot = new PortfolioChatbot(qaData, {
        systemPrompt: `You are an AI assistant for Aryan Sirdesai, a Computer Science Engineer, Data Scientist, and AI & Machine Learning Enthusiast. 
          Answer questions about Aryan based on the knowledge provided. Be friendly, professional, and concise.
          If you don't know an answer, say so politely. Mention that interested parties can reach out at enthusiastic.aryan@gmail.com for more information.`
      });
      
      // Wait for initialization to complete
      await this.chatbot.initializationPromise;
      
      this.isInitialized = true;
      
      // Show welcome message
      this.addBotMessage("Hello! I'm Aryan's virtual assistant. How can I help you today?");
      
      // Process any messages that came in while initializing
      this.processQueuedMessages();
      
      // Enable input
      this.enableInput();
      
    } catch (error) {
      console.error("Error initializing chatbot:", error);
      this.addBotMessage("I'm having trouble starting up. Please refresh the page and try again.");
    }
  }
  
  createUI() {
    // Create chatbot container
    this.container = document.createElement('div');
    this.container.className = 'chatbot-container';
    this.container.innerHTML = `
      <div class="chatbot-toggle">
        <i class="chat-icon">💬</i>
      </div>
      <div class="chatbot-window">
        <div class="chatbot-header">
          <h3>Aryan's Assistant</h3>
          <button class="close-btn">×</button>
        </div>
        <div class="chatbot-messages"></div>
        <div class="chatbot-input-container">
          <input type="text" class="chatbot-input" placeholder="Type your message..." disabled>
          <button class="chatbot-send-btn" disabled>Send</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.container);
    
    // Get UI elements
    this.toggleBtn = this.container.querySelector('.chatbot-toggle');
    this.chatWindow = this.container.querySelector('.chatbot-window');
    this.messagesContainer = this.container.querySelector('.chatbot-messages');
    this.inputField = this.container.querySelector('.chatbot-input');
    this.sendBtn = this.container.querySelector('.chatbot-send-btn');
    this.closeBtn = this.container.querySelector('.close-btn');
    
    // Add event listeners
    this.toggleBtn.addEventListener('click', () => this.toggleChat());
    this.closeBtn.addEventListener('click', () => this.toggleChat(false));
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    this.inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
    
    // Add styles
    this.addStyles();
  }
  
  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .chatbot-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        font-family: 'Roboto', sans-serif;
      }
      
      .chatbot-toggle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: #3498db;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
      }
      
      .chatbot-toggle:hover {
        transform: scale(1.05);
        background-color: #2980b9;
      }
      
      .chat-icon {
        font-size: 25px;
        color: white;
      }
      
      .chatbot-window {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 350px;
        height: 500px;
        background-color: #121212;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        display: none;
        border: 1px solid #3498db;
      }
      
      .chatbot-header {
        padding: 15px;
        background-color: #3498db;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .chatbot-header h3 {
        margin: 0;
        font-size: 16px;
      }
      
      .close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
      }
      
      .chatbot-messages {
        flex: 1;
        padding: 15px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .message {
        max-width: 80%;
        padding: 10px 15px;
        border-radius: 18px;
        margin-bottom: 5px;
        word-wrap: break-word;
      }
      
      .user-message {
        background-color: #3498db;
        color: white;
        align-self: flex-end;
        border-bottom-right-radius: 5px;
      }
      
      .bot-message {
        background-color: #2c2c2c;
        color: #f4f4f4;
        align-self: flex-start;
        border-bottom-left-radius: 5px;
      }
      
      .chatbot-input-container {
        display: flex;
        padding: 10px;
        background-color: #1a1a1a;
      }
      
      .chatbot-input {
        flex: 1;
        padding: 10px;
        border: 1px solid #3498db;
        border-radius: 5px;
        background-color: #2c2c2c;
        color: #f4f4f4;
      }
      
      .chatbot-send-btn {
        padding: 10px 15px;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 5px;
        margin-left: 10px;
        cursor: pointer;
      }
      
      .chatbot-send-btn:disabled,
      .chatbot-input:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Typing indicator animation */
      .typing-indicator {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 10px 15px;
        background-color: #2c2c2c;
        border-radius: 18px;
        border-bottom-left-radius: 5px;
        align-self: flex-start;
        margin-bottom: 5px;
      }
      
      .typing-indicator .dot {
        width: 8px;
        height: 8px;
        background-color: #f4f4f4;
        border-radius: 50%;
        animation: typing-dot 1.4s infinite ease-in-out;
      }
      
      .typing-indicator .dot:nth-child(1) {
        animation-delay: 0s;
      }
      
      .typing-indicator .dot:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      .typing-indicator .dot:nth-child(3) {
        animation-delay: 0.4s;
      }
      
      @keyframes typing-dot {
        0%, 60%, 100% {
          transform: translateY(0);
        }
        30% {
          transform: translateY(-5px);
        }
      }
      
      @media (max-width: 480px) {
        .chatbot-window {
          width: 300px;
          height: 450px;
          bottom: 70px;
        }
        
        .message {
          max-width: 85%;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  toggleChat(open = undefined) {
    this.isOpen = open !== undefined ? open : !this.isOpen;
    this.chatWindow.style.display = this.isOpen ? 'flex' : 'none';
    
    if (this.isOpen) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      this.inputField.focus();
    }
  }
  
  addUserMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message user-message';
    messageElement.textContent = text;
    this.messagesContainer.appendChild(messageElement);
    this.scrollToBottom();
  }
  
  addBotMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message bot-message';
    messageElement.textContent = text;
    this.messagesContainer.appendChild(messageElement);
    this.scrollToBottom();
  }
  
  showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = `
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    `;
    indicator.id = 'typing-indicator';
    this.messagesContainer.appendChild(indicator);
    this.scrollToBottom();
    return indicator;
  }
  
  removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
  }
  
  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
  
  enableInput() {
    this.inputField.disabled = false;
    this.sendBtn.disabled = false;
    this.inputField.placeholder = "Type your message...";
  }
  
  disableInput() {
    this.inputField.disabled = true;
    this.sendBtn.disabled = true;
  }
  
  async sendMessage() {
    const userInput = this.inputField.value.trim();
    if (!userInput) return;
    
    // Clear input field
    this.inputField.value = '';
    
    // Add user message to chat
    this.addUserMessage(userInput);
    
    if (!this.isInitialized) {
      // Queue message for processing after initialization
      this.messageQueue.push(userInput);
      this.addBotMessage("I'm still getting ready. Your message will be processed in a moment.");
      return;
    }
    
    // Disable input while processing
    this.disableInput();
    
    // Show typing indicator
    const typingIndicator = this.showTypingIndicator();
    
    try {
      // Get response from chatbot
      const response = await this.chatbot.chat(userInput);
      
      // Remove typing indicator
      this.removeTypingIndicator();
      
      // Add bot response to chat
      this.addBotMessage(response.text);
      
    } catch (error) {
      console.error("Error getting chatbot response:", error);
      this.removeTypingIndicator();
      this.addBotMessage("I'm sorry, something went wrong. Please try again.");
    }
    
    // Re-enable input
    this.enableInput();
    this.inputField.focus();
  }
  
  async processQueuedMessages() {
    if (this.messageQueue.length > 0) {
      const pendingMessages = [...this.messageQueue];
      this.messageQueue = [];
      
      for (const message of pendingMessages) {
        await this.sendMessage(message);
      }
    }
  }
}

export default ChatbotUI;