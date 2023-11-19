import json
import boto3

# Initialize a DynamoDB client
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('user')

def lambda_handler(event, context):
    body = json.loads(event['body'])
    username = event['pathParameters']['username'] 
    new_preferences = json.dumps(body)
    
    # Check if user is logged in
    response = table.get_item(Key={'username': username})
    if 'Item' not in response or not response['Item'].get('isLoggedIn'):
        return {
            'statusCode': 403,
            'body': json.dumps('User is not logged in or does not exist.')
        }


    # Update user preferences
    table.update_item(
        Key={'username': username},
        UpdateExpression="set preferences = :p",
        ExpressionAttributeValues={
            ':p': new_preferences
        },
        ReturnValues="UPDATED_NEW"
    )

    return {
        'statusCode': 200,
        'body': json.dumps('User preferences updated successfully.')
    }
