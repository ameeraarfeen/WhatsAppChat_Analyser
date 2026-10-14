import re
import pandas as pd

def process(data):
    pattern = r'\d{1,2}/\d{1,2}/\d{2,4},\s\d{1,2}:\d{2}\s-\s' #splitting the wtsap msg between date and msg
    messages= re.split(pattern, data)[1:] #using [1:] to remove the space at the start
    dates=re.findall(pattern, data)
    
    #creating pandas dataframe
    df = pd.DataFrame({
        'user_message': messages,
        'date': dates
    })

    #converting the date column 
    
    df['date'] = pd.to_datetime(
        df['date'].str.replace(r'\s+-\s*$', '', regex=True),
        format='mixed',
        dayfirst=True,
        errors='coerce'
    )


    #separating user and msgs
    users = []
    messages_only = []

    for message in df['user_message']:
        entry = re.split(r'([\w\W]+?):\s', message)

        if len(entry) >= 3:
            users.append(entry[1])
            messages_only.append(entry[2])
        else:
            users.append('group_notification')
            messages_only.append(entry[0])
    df['user'] = users
    df['message'] = messages_only

    #making columns for year month and date hour min
    df['year']=df['date'].dt.year
    df['month']=df['date'].dt.month_name()
    df['month_num'] = df['date'].dt.month
    df['day']=df['date'].dt.day
    df['hour']=df['date'].dt.hour
    df['minute']=df['date'].dt.minute
    df['only_date'] = df['date'].dt.date
    df['day_name'] = df['date'].dt.day_name()

    return df
