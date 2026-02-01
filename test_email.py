
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_test_email():
    email = 'n4460220@gmail.com'
    password = 'qaeo ezuy asht luzm'
    recipient = 'n4460220@gmail.com' # Sending to self for test

    msg = MIMEMultipart()
    msg['From'] = f"BloodLife Test <{email}>"
    msg['To'] = recipient
    msg['Subject'] = "SMTP Config Test"
    
    body = "If you are reading this, your SMTP configuration with Google App Passwords is working correctly!"
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(email, password)
        text = msg.as_string()
        server.sendmail(email, recipient, text)
        server.quit()
        print("Success: Test email sent!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    send_test_email()
