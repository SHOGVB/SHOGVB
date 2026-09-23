/* =========================================
   SHOGVB CONTACT FORM
========================================= */


const contactForm =
    document.getElementById(
        "contactForm"
    );


const contactMessage =
    document.getElementById(
        "contactMessage"
    );


const contactSubmitButton =
    document.getElementById(
        "contactSubmitButton"
    );



/* =========================================
   FORM SUBMISSION
========================================= */

contactForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        /* =================================
           GET FORM VALUES
        ================================= */

        const name =
            document
                .getElementById("name")
                .value
                .trim();


        const email =
            document
                .getElementById("email")
                .value
                .trim();


        const subject =
            document
                .getElementById("subject")
                .value
                .trim();


        const message =
            document
                .getElementById("message")
                .value
                .trim();



        /* =================================
           BASIC VALIDATION
        ================================= */

        if (
            !name ||
            !email ||
            !message
        ) {

            showContactMessage(
                "Please complete all required fields.",
                "error"
            );

            return;

        }



        /* =================================
           DISABLE BUTTON WHILE SENDING
        ================================= */

        contactSubmitButton.disabled =
            true;


        contactSubmitButton.textContent =
            "Sending...";


        showContactMessage(
            "Sending your message...",
            "sending"
        );



        /* =================================
           SAVE MESSAGE TO SUPABASE
        ================================= */

        const { error } =
            await sb
                .from(
                    "contact_messages"
                )
                .insert({

                    name: name,

                    email: email,

                    subject:
                        subject || null,

                    message: message

                });



        /* =================================
           ERROR
        ================================= */

        if (error) {

            console.error(
                "Contact form error:",
                error
            );


            showContactMessage(
                "Unable to send your message. Please try again.",
                "error"
            );


            contactSubmitButton.disabled =
                false;


            contactSubmitButton.textContent =
                "Send Message";


            return;

        }



        /* =================================
           SUCCESS
        ================================= */

        contactForm.reset();


        showContactMessage(
            "✓ Your message has been sent successfully!",
            "success"
        );


        contactSubmitButton.disabled =
            false;


        contactSubmitButton.textContent =
            "Send Message";

    }
);



/* =========================================
   STATUS MESSAGE
========================================= */

function showContactMessage(
    message,
    type
) {

    contactMessage.textContent =
        message;


    contactMessage.className =
        "contact-message";


    if (type) {

        contactMessage
            .classList
            .add(
                `contact-${type}`
            );

    }

}
