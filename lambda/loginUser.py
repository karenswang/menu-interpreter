import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('user')

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
    if user['password'] != password:
        return {
            'statusCode': 400,
            'body': json.dumps('Invalid username/password.')
        }

    # Set isLoggedIn flag to true
    table.update_item(
        Key={'username': username},
        UpdateExpression="set isLoggedIn = :val",
        ExpressionAttributeValues={':val': True},
        ReturnValues="UPDATED_NEW"
    )

    return {
        'statusCode': 200,
        'body': json.dumps('User logged in successfully.')
    }
