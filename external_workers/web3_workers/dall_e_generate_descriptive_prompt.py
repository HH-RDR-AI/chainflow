import asyncio
import os
import logging
from camunda.external_task.external_task import ExternalTask, TaskResult
from camunda.external_task.external_task_worker import ExternalTaskWorker
from openai import AsyncOpenAI

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Environment variables to configure the script
TOPIC_NAME = os.getenv('TOPIC_NAME', "DallEGenerateDescriptivePrompt")
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
async def describe_image_with_openai_vision(image_url, name, description, image_type):
    # Example of logging an operation
    logging.info(f"Generating description for {image_type} image: {image_url}")
    if image_type == 'person':
        prompt = "Analyze the photograph and provide a comprehensive description of the person's physical appearance, focusing on facial features such as the shape and proportion of the face, eyes, nose, mouth, hair texture and color, as well as the body type. Exclude clothing, accessories, and background. Maximum length 250 words."
    else:
        prompt = "Provide a detailed analysis of the visual elements, colors, textures, and any distinctive stylistic features present in the image. Focus on describing the composition, any patterns or motifs, the use of light and shadow, and overall thematic presence. Refrain from evaluating the artistic medium or categorizing the image; concentrate only on the observable details. Maximum length 250 words."

    prompt = f"{prompt}\n\nArtwork Name: {name}\n\nArtwork Description: {description}"

    try:
        response = await client.chat.completions.create(model="gpt-4-1106-vision-preview",
                                                        messages=[
                                                            {
                                                                "role": "user",
                                                                "content": [
                                                                    {"type": "text", "text": prompt},
                                                                    {"type": "image_url", "image_url": image_url}
                                                                ],
                                                            }
                                                        ])

        # Process the response
        if response.choices and len(response.choices) > 0:
            choice = response.choices[0]
            description_text = choice.message.content
            return description_text.strip()
        logging.error(f"Error while generating description for image: {e}")
        return None
    except Exception as e:
        logging.error(f"Error while generating description for image: {e}")
        return None


# Function to handle tasks from Camunda
def handle_task(task: ExternalTask) -> TaskResult:
    # Task handling code with added logging
    logging.info(f"Handling task")
    variables = task.get_variables()
    img_art_thumbnail = variables.get("img_art_thumbnail")
    art_name = variables.get("art_name")
    art_description = variables.get("art_description")
    image_type = variables.get("image_type")
    loop = asyncio.get_event_loop()
    description = loop.run_until_complete(describe_image_with_openai_vision(img_art_thumbnail, art_name,
                                                                            art_description, image_type))
    if not description:
        return task.bpmn_error(
            "art_description_generation_failed",
            "art_description_generation_failed",
            variables
        )
    if image_type == 'person':
        variables["person_description_prompt"] = description
    else:
        variables["art_description_prompt"] = description
    return task.complete(variables)


if __name__ == '__main__':
    # Worker initialization with logging
    logging.info("Initializing Camunda External Task Worker")
    ExternalTaskWorker(worker_id="1", base_url=CAMUNDA_URL, config=default_config).subscribe([TOPIC_NAME], handle_task)
