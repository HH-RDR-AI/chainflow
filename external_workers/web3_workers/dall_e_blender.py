"""
const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: descriptivePrompt,
            size: "1024x1024",
            quality: "standard",
            n: 1,
        });

        const generatedImageUrls = response.data.map(image => image.url);
        const savedImageUrls = await uploadImageFromUrl(generatedImageUrls, user_id, worker);

        const processVariables = new Variables();
        processVariables.set('blended_image_url', savedImageUrls)
        await taskService.complete(task, processVariables);
    } catch (error) {
        console.error('Error when trying to generate image with DALL-E:', error);
        // await taskService.handleBpmnError(task, 'DaleeFailure', error)
        await taskService.handleFailure(task, {
            errorMessage: error.message,
            errorDetails: error.stack,
            retries: 0,
            retryTimeout: 0,
        });
        throw error;
    }

"""


import asyncio
import os
import logging
from camunda.external_task.external_task import ExternalTask, TaskResult
from camunda.external_task.external_task_worker import ExternalTaskWorker
from openai import AsyncOpenAI

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Environment variables to configure the script
TOPIC_NAME = os.getenv('TOPIC_NAME', "DallEGenerateArtBlender")
CAMUNDA_URL = os.getenv('CAMUNDA_URL', 'http://localhost:8080/engine-rest')

# Logging the script startup
logging.info("Starting Dali Generate Art Prompt script")

# Configuration for the Camunda External Task Client
default_config = {
    "maxTasks": 1,
    "lockDuration": 10000,
    "asyncResponseTimeout": 5000,
    "retries": 3,
    "retryTimeout": 15000,
    "sleepSeconds": 10
}

# Initialize the AsyncOpenAI client with an API key from environment variables
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# Main function to describe images using OpenAI's model
async def blend_art_and_user(art_id: str, user_id: str):
    # Here goes worker requesting art_id, user_id, event_id from api, and then blending  the prompts recieved
    # with the DALL-E model
    pass

# Function to handle tasks from Camunda
def handle_task(task: ExternalTask) -> TaskResult:
    # Task handling code with added logging
    logging.info(f"Handling task")
    variables = task.get_variables()
    art_id = variables.get("art_id")
    user_id = variables.get("user_id")
    loop = asyncio.get_event_loop()
    blended_image = loop.run_until_complete(blend_art_and_user(art_id, user_id))
    if not blended_image:
        return task.bpmn_error(
            "blended_image_generation_failed",
            "blended_image_generation_failed",
            variables
        )
    variables["blended_image_url"] = blended_image
    return task.complete(variables)


if __name__ == '__main__':
    # Worker initialization with logging
    logging.info("Initializing Camunda External Task Worker")
    ExternalTaskWorker(worker_id="1", base_url=CAMUNDA_URL,
                       config=default_config).subscribe([TOPIC_NAME], handle_task)
