# CryptoBOT Twitter
- Extension to [CryptoBOT](https://twitter.com/crypto3ot)


1. Create a database on MongoDB with required collections.

## Database Models
	User
		- ID
		- @username
		- screen_name
		- subscriptions
		- alerts
		  
	SYMBOL
		- ID
		- SYMBOL
		- USERS (ID)

	CUSTOM_ALERT
		- ID
		- SYMBOL
		- USER_ID
		- TRIGGER_PRICE
		- PRICE_WHEN_SET

## Algorithm

2. Create a web server to listen to web hook events with payloads. (Symbol and Price)
3. With that Payload:
	- Query the Twitter users database for alert triggers.
	- If triggered, send out a noitification event to notify user of that alert.
	- Query the twitter users database for Custom alert triggers
	- If triggered, Notify custom alert.
