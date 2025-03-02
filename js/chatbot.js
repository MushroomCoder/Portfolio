// chatbot.js
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HuggingFaceInference } from "langchain/llms/hf";
import { HuggingFaceTransformersEmbeddings } from "langchain/embeddings/hf_transformers";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { HumanMessage, AIMessage, SystemMessage } from "langchain/schema";

// Class representing the Portfolio AI Chatbot
class PortfolioChatbot {
  constructor(qaData, config = {}) {
    this.qaData = qaData;
    this.config = {
      modelName: config.modelName || "meta/llama-3.2-1b",
      temperature: config.temperature || 0.5,
      maxTokens: config.maxTokens || 512,
      systemPrompt: config.systemPrompt || 
        "You are an AI assistant for Aryan Sirdesai. Answer questions based on the information provided. " +
        "Be friendly, professional, and concise. If you don't know an answer, say so politely.",
      ...config
    };
    
    this.initialized = false;
    this.initializationPromise = this.initialize();
  }

  async initialize() {
    try {
      // Add this near the top of chatbot.js
        const HF_API_TOKEN = "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";

        // Then update the HuggingFaceInference constructor
        this.model = new HuggingFaceInference({
        model: this.config.modelName,
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
        apiKey: HF_API_TOKEN,  // Add this line
        });

        // And update the HuggingFaceTransformersEmbeddings constructor
        this.embeddings = new HuggingFaceTransformersEmbeddings({
        modelName: "sentence-transformers/all-MiniLM-L6-v2",
        apiKey: HF_API_TOKEN,  // Add this line
        });

      // Create document objects from the QA data
      const documents = Object.entries(this.qaData).map(([question, answer]) => ({
        pageContent: `Question: ${question}\nAnswer: ${answer}`,
        metadata: { source: "knowledge-base", type: "qa-pair" }
      }));

      // Create a vector store from the documents
      this.vectorStore = await MemoryVectorStore.fromDocuments(
        documents,
        this.embeddings
      );

      // Create a chat memory
      this.memory = new BufferMemory({
        memoryKey: "chat_history",
        returnMessages: true,
        inputKey: "question",
        outputKey: "text",
      });

      // Create a retrieval chain
      this.chain = ConversationalRetrievalQAChain.fromLLM(
        this.model,
        this.vectorStore.asRetriever(),
        {
          memory: this.memory,
          returnSourceDocuments: true,
        }
      );

      this.initialized = true;
      console.log("Chatbot initialization complete");
      return true;
    } catch (error) {
      console.error("Error initializing chatbot:", error);
      throw error;
    }
  }

  async chat(userMessage) {
    // Make sure initialization is complete
    if (!this.initialized) {
      await this.initializationPromise;
    }

    try {
      // Process the message through the chain
      const response = await this.chain.call({
        question: userMessage,
        chat_history: await this.memory.chatHistory.getMessages(),
      });

      return {
        text: response.text,
        sourceDocuments: response.sourceDocuments || [],
      };
    } catch (error) {
      console.error("Error in chat:", error);
      return {
        text: "I'm sorry, I encountered an error while processing your request. Please try again.",
        error: error.message,
      };
    }
  }

  async resetConversation() {
    await this.memory.clear();
    return "Conversation has been reset.";
  }
}

export default PortfolioChatbot;