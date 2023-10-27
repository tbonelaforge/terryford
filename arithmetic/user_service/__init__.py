update_username_template = ("UPDATE user SET username = '%s' WHERE id = %s")
get_user_template = ("SELECT id as user_id, username, created_date FROM user WHERE id = %s")

def update_username(db, user_id, username):
    if db is None:
        return None
    
    uppercase_username = (username[:20]).upper()
    update_username_statement = update_username_template % (uppercase_username, user_id)
    # print("About to try and execute the update_username statement:\n")
    # print(update_username_statement)
    cursor = db.cursor()
    cursor.execute(update_username_statement)
    db.commit()
    cursor = db.cursor()
    get_user_statement = get_user_template % (user_id)
    # print("About to try and execute the get_user_statement:\n")
    # print(get_user_statement)
    cursor.execute(get_user_statement)
    return_value = None
    for (user_id, username, created_date) in cursor:
        return_value = {
            "id": user_id,
            "username": username,
            "createdDate": created_date
        }
    cursor.close()
    return return_value
