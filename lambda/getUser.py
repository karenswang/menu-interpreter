import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('user')

def lambda_handler(event, context):
    print(event)
    username = event['queryStringParameters']['username']
    
    # Check if user is logged in
    response = table.get_item(Key={'username': username})
    if 'Item' not in response or not response['Item'].get('isLoggedIn'):
        return {
            'statusCode': 403,
            'body': json.dumps('User is not logged in or does not exist.')
        }

    user_data = response['Item']

    # Remove sensitive data before returning
    user_data.pop('password', None)
    user_data.pop('isLoggedIn', None)

    return {
        'statusCode': 200,
        'body': json.dumps(user_data)
    }