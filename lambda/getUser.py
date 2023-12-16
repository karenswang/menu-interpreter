import json
import boto3
import jwt

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('user')
SECRET_KEY = "vBufvEPGHrZ0ii_y0Fw4NsFY2x9IKocy"

def lambda_handler(event, context):
    print(event)
    username = event['pathParameters']['username']
    
    # Check if user is logged in
    response = table.get_item(Key={'username': username})
    if 'Item' not in response:
        return {
            'statusCode': 403,
            'body': json.dumps('User is not logged in or does not exist.')
        }
    
    # Check if JWT is provided in the headers
    if 'Authorization' not in event['headers']:
        return {
            'statusCode': 403,
            'body': json.dumps('Authorization token is missing. User is not logged in or does not exist.')
        }

    token = event['headers']['Authorization']
    
    try:
        # Verify and decode the JWT token
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        
        # Check if the username in the token matches the requested username
        if decoded_token.get('username') != username:
            return {
                'statusCode': 403,
                'body': json.dumps('User log in expired, please log in again!')
            }
        
        # JWT validation passed, continue processing the request
        user_data = response['Item']

        # Remove sensitive data before returning
        user_data.pop('password', None)

        return {
            'statusCode': 200,
            'body': json.dumps(user_data)
        }
    except jwt.ExpiredSignatureError:
        return {
            'statusCode': 401,
            'body': json.dumps('User login has expired. Please log in again.')
        }
    except jwt.DecodeError:
        return {
            'statusCode': 401,
            'body': json.dumps('User login invalid or corrupted. Please log in again.')
        }
