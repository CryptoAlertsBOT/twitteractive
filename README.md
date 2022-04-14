# CryptoBOT Twitter
- Extension to [CryptoBOT](https://twitter.com/crypto3ot)


1. Create a database on MongoDB with required collections.

## Database Models
	User
		- ID
		- twitterID
		- @username
		- screen_name
		- subscriptions
		- alerts
		  
	SYMBOL
		- ID
		- SYMBOL
		- SUBS (ID)
		
	SUBSCRIPTION
		- ID
		- SYMBOL (ID)
		- USER (ID)

	CUSTOM_ALERT
		- ID
		- SYMBOL
		- USER_ID
		- TRIGGER_PRICE
		- PRICE_WHEN_SET
		
	PURGED_SUB
		- ID
		- SYMBOL
		- USER
		- CREATED_AT
		- DELETED_ON
		
	PURGED_ALERT
		- ID
		- SYMBOL
		- USER
		- PRICE_WHEN_SET
		- TRIGGER_PRICE
		- CREATED_AT
		- DELETED_ON

## Algorithm

2. Create a web server to listen to web hook events with payloads. (Symbol and Price)
3. With that Payload:
	- Query the Twitter users database for alert triggers.
	- If triggered, send out a noitification event to notify user of that alert.
	- Query the twitter users database for Custom alert triggers
	- If triggered, Notify custom alert.
