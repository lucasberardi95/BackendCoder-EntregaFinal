import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'lucasberardi.18@gmail.com',
        pass: process.env.PASSWORD_EMAIL,
        authMethod: 'LOGIN'
    }
})

//Nodemailer functions

export const sendRecoveryEmail = (email, recoveryLink) => {
    const mailOptions = {
        from: 'lucasberardi.18@gmail.com',
        to: email,
        subject: 'Password recovery link',
        text: `Click the following link ${recoveryLink}`
    }
    transporter.sendMail(mailOptions, (error, info) => {
        if(error){
            console.log(error);
        } else {
            console.log('Email sent successfully');
        }
    })
}

export const sendAccountDeletionEmail = (email) => {
    const mailOptions = {
        from: 'lucasberardi.18@gmail.com',
        to: email,
        subject: 'Account Deletion Notification',
        text: 'Your account has been deleted due to inactivity.'
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error)
        } else {
            console.log('Account deletion notification email sent successfully')
        }
    })
}

export const sendPurchaseConfirmationEmail = (email, ticket) => {
    const mailOptions = {
        from: 'lucasberardi.18@gmail.com',
        to: email,
        subject: 'Purchase confirmation',
        text: `Thank you for your purchase! Here is your purchase details:\n\nAmount: $${ticket.amount}\n\nCode: ${ticket.code}\n\nPurchase Date: ${ticket.purchase_datetime}`
    }

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error)
                reject(error)
            } else {
                console.log('Purchase confirmation email sent successfully')
                resolve(info)
            }
        })
    })
}