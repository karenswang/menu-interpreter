import json
import boto3

# Initialize a DynamoDB client
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('user')

def lambda_handler(event, context):
    # Extract username and password from the event
    print(event)
    # because username and passwords are passed in as request body
    body = json.loads(event['body'])
    username = body['username']
    password = body['password']

    # Check if user already exists
    response = table.get_item(Key={'username': username})
    if 'Item' in response:
        return {
            'statusCode': 400,
            'body': json.dumps('User already exists.')
        }

    # Add new user without preferences
    table.put_item(Item={
        'username': username,
        'password': password,
        'isLoggedIn': False,
        # Initialize preferences as an empty object
        'preferences': {}
    })

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps('User registered successfully.')
    }
