import json
import boto3
import bcrypt
import jwt
import time

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('user')
SECRET_KEY = "vBufvEPGHrZ0ii_y0Fw4NsFY2x9IKocy"

def lambda_handler(event, context):
    print(event)
    # because username and passwords are passed in as request body
    body = json.loads(event['body'])
    username = body['username']
    password = body['password']

    # Retrieve user from DynamoDB
    response = table.get_item(Key={'username': username})
    if 'Item' not in response:
        return {
            'statusCode': 404,
            'body': json.dumps('User not found.')
        }

    user = response['Item']
    
    # Check password
    if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        return {
            'statusCode': 404,
            'body': json.dumps('Invalid username/password.')
        }

    # # Set isLoggedIn flag to true
    # table.update_item(
    #     Key={'username': username},
    #     UpdateExpression="set isLoggedIn = :val",
    #     ExpressionAttributeValues={':val': True},
    #     ReturnValues="UPDATED_NEW"
    # )

    # Create JWT token
    token = jwt.encode({
        'username': username,
        'iat': int(time.time()),
        'exp': int(time.time()) + 3600  # Token expires in 1 hour
    }, SECRET_KEY, algorithm='HS256')

    return {
        'statusCode': 200,
        'headers': {
            'Authorization': token  # Include the token in the response headers
        },
        'body': json.dumps('User logged in successfully.')
    }
