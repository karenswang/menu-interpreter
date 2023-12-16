import json
import boto3
import bcrypt
import jwt
import time

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('user')
SECRET_KEY = "vBufvEPGHrZ0ii_y0Fw4NsFY2x9IKocy"

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
    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # Add new user without preferences
    table.put_item(Item={
        'username': username,
        'password': hashed_password,
        #'isLoggedIn': False,
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
