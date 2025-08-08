import os
import logging
import traceback
from dotenv import load_dotenv
from langchain.chains import LLMChain
from langchain.prompts import ChatPromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder
from langchain.schema import SystemMessage
from langchain.memory import ConversationBufferWindowMemory
from langchain_groq import ChatGroq
from yaml_utils import setup_and_load_yaml
from template import Template  # Import the Template class

# Disable parallelism in tokenizers to avoid deadlocks
os.environ["TOKENIZERS_PARALLELISM"] = "false"

class ChatbotProcessor:
    def __init__(self):
        load_dotenv()
        logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
        
        self.groq_api_key = os.getenv('GROQ_API_KEY')
        self.model_name = os.getenv('CHAT_MODEL_NAME', 'llama3-8b-8192')

        self.chat_model = ChatGroq(groq_api_key=self.groq_api_key, model_name=self.model_name)

        self.system_prompt = (
            "Hello! I'm your friendly virtual assistant. "
            "I'm here to help you reflect on your experiences and emotions. "
            "Please tell me what you would like to discuss today."
        )
        self.conversational_memory_length = 5  # Set the desired length of the memory buffer
        self.memory = ConversationBufferWindowMemory(k=self.conversational_memory_length, memory_key="chat_history", return_messages=True)

        tools_filepath = 'tools.yaml'
        self.tools = setup_and_load_yaml(tools_filepath, 'tools')

        # Initialize the template with tools
        self.template = Template(self.tools)

    def handle_query(self, query):
        try:
            # Use the template to generate a structured prompt
            structured_prompt = self.template.generate_prompt(query)
            
            chat_prompt = ChatPromptTemplate.from_messages(
                [
                    SystemMessage(content=self.system_prompt),
                    MessagesPlaceholder(variable_name="chat_history"),
                    HumanMessagePromptTemplate.from_template(structured_prompt)
                ]
            )

            conversation = LLMChain(
                llm=self.chat_model,
                prompt=chat_prompt,
                verbose=False,
                memory=self.memory
            )

            response = conversation.predict(human_input=query)
            return response
        except Exception as e:
            logging.error(f"Failed to handle chat query: {e}")
            logging.error(traceback.format_exc())
            raise

if __name__ == "__main__":
    processor = ChatbotProcessor()
    while True:
        try:
            user_input = input("You: ")
            if user_input.lower() in ['exit', 'quit']:
                break
            response = processor.handle_query(user_input)
            print(f"Bot: {response}")
        except KeyboardInterrupt:
            break
        except Exception as e:
            logging.error(f"Error in main loop: {e}")
            logging.error(traceback.format_exc())
