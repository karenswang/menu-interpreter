
# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

"""
Purpose
An AWS lambda function that analyzes documents with Amazon Textract.
"""
import json
import base64
import logging
import boto3
import uuid
import base64

from botocore.exceptions import ClientError

# Set up logging.
logger = logging.getLogger(__name__)

# Get the boto3 client.
textract_client = boto3.client('textract')
dynamodb = boto3.resource('dynamodb')


def lambda_handler(event, context):
    """
    Lambda handler function
    param: event: The event object for the Lambda function.
    param: context: The context object for the lambda function.
    return: The list of Block objects recognized in the document
    passed in the event object.
    """

    try:

        # Determine document source.
        # if 'image' in event:
        #     # Decode the image
        #     image_bytes = event['image'].encode('utf-8')
        #     img_b64decoded = base64.b64decode(image_bytes)
        #     image = {'Bytes': img_b64decoded}
        #     print("using image")

        print(event)

        # elif 's3' in event:
        bucket = event['Records'][0]['s3']['bucket']['name']
        object_key = event['Records'][0]['s3']['object']['key']
        image = {'S3Object':
                    {'Bucket':  bucket,
                     'Name': object_key}
                    }

            # # Get bucket name and object key from the S3 event
            # bucket = event['Records'][0]['s3']['bucket']['name']
            # object_key = event['Records'][0]['s3']['object']['key']
            # s3_object = s3.get_object(Bucket=bucket, Key=object_key)
            # # # Read the object data as a string
            # image_data_url = s3_object['Body'].read().decode('utf-8')
            # # # Extract the base64-encoded image data from the Data URL
            # base64_image_data = image_data_url.split("base64,")[1]
            # # # Decode the base64-encoded image
            # image_data_bytes = base64.b64decode(base64_image_data)

        # else:
        #     raise ValueError(
        #         'Invalid source. Only image base 64 encoded image bytes or S3Object are supported.')


        # Analyze the document.
        response = textract_client.detect_document_text(Document=image)

        # Get the Blocks
        blocks = response['Blocks']
        
        extracted_text = extract_text_from_textract_response(response)
        print(extracted_text)

    except ClientError as err:
        error_message = "Couldn't analyze image. " + \
            err.response['Error']['Message']

        lambda_response = {
            'statusCode': 400,
            'body': {
                "Error": err.response['Error']['Code'],
                "ErrorMessage": error_message
            }
        }
        logger.error("Error function %s: %s",
            context.invoked_function_arn, error_message)

    except ValueError as val_error:
        lambda_response = {
            'statusCode': 400,
            'body': {
                "Error": "ValueError",
                "ErrorMessage": format(val_error)
            }
        }
        logger.error("Error function %s: %s",
            context.invoked_function_arn, format(val_error))

    # Extract restaurant name from the file name (assuming file name is the restaurant name)
    restaurant_name = object_key
    save_to_dynamodb('menu-items', restaurant_name, extracted_text)

    lambda_response = {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*'
        },
        "body": json.dumps('File successfully uploaded for analysis.')
    }
    
    return lambda_response


def extract_text_from_textract_response(response):
    extracted_text = ""

    # Check if 'Blocks' is in the response
    if 'Blocks' in response:
        # Iterate over each block
        for block in response['Blocks']:
            # Check if the block type is 'LINE' (or 'WORD' if you need each word separately)
            if block['BlockType'] == 'LINE':
                # Append the detected text to the extracted_text string
                if 'Text' in block:
                    extracted_text += block['Text'] + ', '  # Adding a comma for each line

    return extracted_text
    
    
def save_to_dynamodb(table_name, restaurant_name, extracted_text):
    table = dynamodb.Table(table_name)
    # menu_id = str(uuid.uuid4())
    try:
        table.put_item(Item={
            # 'menu_id': menu_id, 
            'menu_id': restaurant_name, # using user-defined restaurant name for now
            'restaurant_name': restaurant_name,
            'menu_text': extracted_text
        })
        logger.info(f"Data saved for restaurant: {restaurant_name}")
    except ClientError as e:
        logger.error("Error saving to DynamoDB: %s", e)