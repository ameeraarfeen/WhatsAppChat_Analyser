
import pandas as pd
import emoji
import re
from collections import Counter
from pathlib import Path

MEDIA_PATTERN = re.compile(
    r'<\s*media omitted\s*>',
    flags=re.IGNORECASE
)

def fetch_stats(selected_user, df):

    # Filter messages for one user, if selected
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    # Total number of messages
    num_messages = df.shape[0]

    # Total number of words
    words = []
    for message in df['message']:
        words.extend(str(message).split())

    # Number of media messages
    num_media_messages = int(
    df['message'].fillna('').astype(str).str.contains(
        MEDIA_PATTERN
    ).sum())

    # Number of links shared
    links = []
    for message in df['message']:
        links.extend(
            re.findall(r'https?://\S+', str(message))
        )

    return num_messages, len(words), num_media_messages, len(links)





def most_busy_users(df):
    user_stats = user_message_percentage(df)

    user_counts = user_stats.set_index('user')['messages']
    user_counts = user_counts.rename('count')

    return user_counts.head(5), user_stats





def monthly_timeline(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    timeline = (
        df.groupby(['year', 'month_num', 'month'])
        .size()
        .reset_index(name='message_count')
    )

    # Sort chronologically
    timeline = timeline.sort_values(['year', 'month_num'])

    # Create a readable label for the frontend
    timeline['time'] = (
        timeline['month'] + ' ' + timeline['year'].astype(str)
    )

    return timeline


def daily_timeline(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    timeline = (
        df.groupby('only_date')
        .size()
        .reset_index(name='message_count')
    )

    timeline = timeline.sort_values('only_date')

    return timeline


def week_activity_map(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    activity = df['day_name'].value_counts()

    days_order = [
        'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday', 'Sunday'
    ]

    activity = activity.reindex(days_order, fill_value=0)

    return activity


def month_activity_map(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    activity = df['month'].value_counts()

    months_order = [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ]

    activity = activity.reindex(months_order, fill_value=0)

    return activity


def user_message_counts(df):
    # Exclude system notifications
    user_df = df[df['user'] != 'group_notification']

    # Count messages sent by each participant
    counts = user_df['user'].value_counts()

    return counts


def user_message_percentage(df):
    # Exclude system notifications
    user_df = df[df['user'] != 'group_notification']

    # Count messages per participant
    counts = user_df['user'].value_counts()

    # Calculate percentage contribution
    total_messages = len(user_df)

    if total_messages == 0:
        return pd.DataFrame(
            columns=['user', 'messages', 'percentage']
        )

    percentages = (counts / total_messages * 100).round(2)

    # Combine everything into a DataFrame
    result = pd.DataFrame({
        'user': counts.index,
        'messages': counts.values,
        'percentage': percentages.values
    })

    return result


def user_word_counts(df):
    # Exclude system notifications
    user_df = df[df['user'] != 'group_notification']

    # Count words for each participant
    word_counts = {}

    for _, row in user_df.iterrows():
        user = row['user']
        message = str(row['message'])

        word_counts[user] = (
            word_counts.get(user, 0) + len(message.split())
        )

    # Convert the dictionary into a DataFrame
    result = pd.DataFrame(
        list(word_counts.items()),
        columns=['user', 'word_count']
    )

    return result.sort_values(
        'word_count', ascending=False
    ).reset_index(drop=True)




def media_message_counts(df):
    user_df = df[df['user'] != 'group_notification']

    media_mask = user_df['message'].fillna('').astype(str).str.contains(
        MEDIA_PATTERN
    )

    return user_df.loc[media_mask, 'user'].value_counts()



def user_link_counts(df):
    user_df = df[df['user'] != 'group_notification']

    link_counts = {}

    for _, row in user_df.iterrows():
        user = row['user']
        message = str(row['message'])

        links = re.findall(r'https?://\S+', message)

        link_counts[user] = (
            link_counts.get(user, 0) + len(links)
        )

    result = pd.DataFrame(
        list(link_counts.items()),
        columns=['user', 'link_count']
    )

    return result.sort_values(
        'link_count', ascending=False
    ).reset_index(drop=True)


def emoji_counts(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    counts = {}

    for message in df['message'].dropna():
        for character in str(message):
            if character in emoji.EMOJI_DATA:
                counts[character] = counts.get(character, 0) + 1

    result = pd.DataFrame(
        list(counts.items()),
        columns=['emoji', 'count']
    )

    return result.sort_values(
        'count', ascending=False
    ).reset_index(drop=True)

def most_common_words(selected_user, df, stopword_file='stop_hinglish.txt'):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    supplied_path = Path(stopword_file)

    if supplied_path.is_absolute():
        stopword_path = supplied_path
    else:
        stopword_path = Path(__file__).resolve().parent.parent / supplied_path

    if not stopword_path.is_file():
        raise FileNotFoundError(
            f"Stopword file not found: {stopword_path}"
        )

    with open(stopword_path, 'r', encoding='utf-8') as file:
        stop_words = {
            line.strip().lower()
            for line in file
            if line.strip()
        }

    words = []

    for message in df['message'].dropna():
        message_words = re.findall(r'\b\w+\b', str(message).lower())

        for word in message_words:

            if word in ['media', 'omitted']:
                continue
            if word not in stop_words and not word.isdigit():
                words.append(word)

    return Counter(words).most_common(20)



def most_busy_hour(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    activity = df['hour'].value_counts()

    # Include all 24 hours, filling missing hours with 0
    activity = activity.reindex(range(24), fill_value=0)

    # Keep hours in chronological order
    activity = activity.sort_index()

    return activity


def monthly_activity_map(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    activity = df['day'].value_counts()

    # Include all days from 1 to 31
    activity = activity.reindex(range(1, 32), fill_value=0)

    return activity.sort_index()


def most_active_day(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    days_order = [
        'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday', 'Sunday'
    ]

    activity = df['day_name'].value_counts()
    activity = activity.reindex(days_order, fill_value=0)

    busiest_day = activity.idxmax() if not df.empty else None
    return activity, busiest_day


def most_active_month(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    months_order = [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ]

    activity = df['month'].value_counts()
    activity = activity.reindex(months_order, fill_value=0)

    busiest_month = activity.idxmax() if not df.empty else None

    return activity, busiest_month


def average_messages_per_active_day(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    if df.empty:
        return 0

    total_messages = len(df)
    active_days = df['only_date'].nunique()

    if active_days == 0:
        return 0

    return round(total_messages / active_days, 2)


def longest_message(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    messages = df['message'].dropna().astype(str)

    if messages.empty:
        return None, 0

    longest = max(messages, key=len)

    return longest, len(longest)


def average_message_length(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    messages = df['message'].dropna().astype(str)

    if messages.empty:
        return 0

    total_characters = messages.str.len().sum()
    average_length = total_characters / len(messages)

    return round(average_length, 2)


def time_of_day_activity(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    def get_time_of_day(hour):
        if 5 <= hour < 12:
            return 'Morning'
        elif 12 <= hour < 17:
            return 'Afternoon'
        elif 17 <= hour < 21:
            return 'Evening'
        else:
            return 'Night'

    activity = df['hour'].apply(get_time_of_day).value_counts()

    time_order = ['Morning', 'Afternoon', 'Evening', 'Night']
    activity = activity.reindex(time_order, fill_value=0)

    return activity


def user_median_message_length(df):
    user_df = df[df['user'] != 'group_notification'].copy()

    user_df['message_length'] = (
        user_df['message'].fillna('').astype(str).str.len()
    )

    result = (
        user_df.groupby('user')['message_length']
        .median()
        .reset_index(name='median_message_length')
    )

    return result.sort_values(
        'median_message_length',
        ascending=False
    )



def weekday_activity(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    # Exclude system notifications
    df = df[df['user'] != 'group_notification']

    # Get the weekday for every message
    df = df.copy()
    df['day_name'] = df['date'].dt.day_name()

    # Keep weekdays in calendar order
    days = [
        'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday', 'Sunday'
    ]

    counts = df['day_name'].value_counts()

    return [
        {'day': day, 'message_count': int(counts.get(day, 0))}
        for day in days
    ]


def daily_timeline(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    # Exclude system notifications
    df = df[df['user'] != 'group_notification']

    df = df.copy()
    df['date_only'] = df['date'].dt.date

    daily_counts = (
        df.groupby('date_only')
        .size()
        .reset_index(name='message_count')
        .sort_values('date_only')
    )

    return [
        {
            'date': str(row['date_only']),
            'message_count': int(row['message_count'])
        }
        for _, row in daily_counts.iterrows()
    ]


def hourly_activity(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    # Exclude system notifications
    df = df[df['user'] != 'group_notification']

    df = df.copy()
    df['hour'] = df['date'].dt.hour

    counts = df['hour'].value_counts()

    return [
        {
            'hour': hour,
            'label': f'{hour:02d}:00',
            'message_count': int(counts.get(hour, 0))
        }
        for hour in range(24)
    ]


def activity_heatmap(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    # Exclude system notifications
    df = df[df['user'] != 'group_notification']

    df = df.copy()
    df['day'] = df['date'].dt.day_name()
    df['hour'] = df['date'].dt.hour

    days = [
        'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday', 'Sunday'
    ]

    counts = (
        df.groupby(['day', 'hour'])
        .size()
        .to_dict()
    )

    return [
        {
            'day': day,
            'hour': hour,
            'label': f'{hour:02d}:00',
            'message_count': int(counts.get((day, hour), 0))
        }
        for day in days
        for hour in range(24)
    ]
