const loginSection =
    document.getElementById("loginSection");

const dashboard =
    document.getElementById("dashboard");

const logoutButton =
    document.getElementById("logoutButton");

const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");

const adminEvents =
    document.getElementById("adminEvents");


const eventModal =
    document.getElementById("eventModal");

const eventForm =
    document.getElementById("eventForm");

const eventMessage =
    document.getElementById("eventMessage");

const addEventButton =
    document.getElementById("addEventButton");

const closeModalButton =
    document.getElementById("closeModalButton");

const cancelModalButton =
    document.getElementById("cancelModalButton");



/* ========================================
   CHECK LOGIN
======================================== */

async function checkSession() {

    const {
        data: { session }
    } = await sb.auth.getSession();


    if (session) {

        showDashboard();

    } else {

        showLogin();

    }

}



function showDashboard() {

    loginSection.classList.add("hidden");

    dashboard.classList.remove("hidden");

    logoutButton.classList.remove("hidden");

    loadAdminEvents();

}



function showLogin() {

    dashboard.classList.add("hidden");

    logoutButton.classList.add("hidden");

    loginSection.classList.remove("hidden");

}



/* ========================================
   LOGIN
======================================== */

loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        loginMessage.textContent =
            "Logging in...";


        const email =
            document
                .getElementById("loginEmail")
                .value;

        const password =
            document
                .getElementById("loginPassword")
                .value;


        const { error } =
            await sb.auth.signInWithPassword({

                email: email,

                password: password

            });


        if (error) {

            console.error(error);

            loginMessage.textContent =
                "Unable to log in. Check your email and password.";

            return;
        }


        loginMessage.textContent = "";

        loginForm.reset();

        showDashboard();

    }
);



/* ========================================
   LOGOUT
======================================== */

logoutButton.addEventListener(
    "click",
    async function() {

        await sb.auth.signOut();

        showLogin();

    }
);



/* ========================================
   LOAD EVENTS
======================================== */

async function loadAdminEvents() {

    adminEvents.innerHTML =
        "<p>Loading schedule...</p>";


    const { data: events, error } =
        await sb
            .from("events")
            .select("*")
            .order(
                "event_date",
                { ascending: true }
            )
            .order(
                "start_time",
                { ascending: true }
            );


    if (error) {

        console.error(error);

        adminEvents.innerHTML =
            "<p>Unable to load events.</p>";

        return;
    }


    if (!events || events.length === 0) {

        adminEvents.innerHTML = `
            <div class="admin-card">
                <h3>No events yet</h3>

                <p>
                    Click "Add Open Gym"
                    to create your first event.
                </p>
            </div>
        `;

        return;
    }


    adminEvents.innerHTML = "";


    events.forEach(event => {

        const card =
            document.createElement("div");

        card.className =
            "admin-event";


        const info =
            document.createElement("div");


        const title =
            document.createElement("h3");

        title.textContent =
            event.title;


        const date =
            document.createElement("p");

        date.textContent =
            formatDate(event.event_date);


        const time =
            document.createElement("p");

        time.textContent =
            `${formatTime(event.start_time)} – ${formatTime(event.end_time)}`;


        const location =
            document.createElement("p");

        location.textContent =
            event.location;


        const address =
            document.createElement("p");

        address.textContent =
            event.address || "";


        const status =
            document.createElement("span");

        status.className = "status";

        status.textContent =
            event.status;


        info.append(
            title,
            date,
            time,
            location
        );


        if (event.address) {
            info.append(address);
        }


        info.append(status);


        const actions =
            document.createElement("div");

        actions.className =
            "admin-event-actions";


        const editButton =
            document.createElement("button");

        editButton.className =
            "secondary-button";

        editButton.textContent =
            "Edit";

        editButton.addEventListener(
            "click",
            () => openEditModal(event)
        );


        const cancelButton =
            document.createElement("button");

        cancelButton.className =
            "secondary-button";

        cancelButton.textContent =
            event.status === "Canceled"
                ? "Reopen"
                : "Cancel";


        cancelButton.addEventListener(
            "click",
            () => toggleCanceled(event)
        );


        const deleteButton =
            document.createElement("button");

        deleteButton.className =
            "danger-button";

        deleteButton.textContent =
            "Delete";


        deleteButton.addEventListener(
            "click",
            () => deleteEvent(event)
        );


        actions.append(
            editButton,
            cancelButton,
            deleteButton
        );


        card.append(
            info,
            actions
        );


        adminEvents.appendChild(card);

    });

}



/* ========================================
   ADD EVENT
======================================== */

addEventButton.addEventListener(
    "click",
    function() {

        eventForm.reset();

        document
            .getElementById("eventId")
            .value = "";

        document
            .getElementById("eventTitle")
            .value =
            "Open Gym Volleyball";

        document
            .getElementById("eventLocation")
            .value =
            "St. Hubert Gym";

        document
            .getElementById("eventAddress")
            .value = "";

        document
            .getElementById("eventStatus")
            .value =
            "Open";

        document
            .getElementById("modalTitle")
            .textContent =
            "Add Open Gym";

        eventMessage.textContent = "";

        eventModal.classList.remove("hidden");

    }
);



/* ========================================
   EDIT EVENT
======================================== */

function openEditModal(event) {

    document
        .getElementById("modalTitle")
        .textContent =
        "Edit Open Gym";


    document
        .getElementById("eventId")
        .value =
        event.id;


    document
        .getElementById("eventTitle")
        .value =
        event.title;


    document
        .getElementById("eventDate")
        .value =
        event.event_date;


    document
        .getElementById("startTime")
        .value =
        event.start_time;


    document
        .getElementById("endTime")
        .value =
        event.end_time;


    document
        .getElementById("eventLocation")
        .value =
        event.location;


    document
        .getElementById("eventAddress")
        .value =
        event.address ?? "";


    document
        .getElementById("eventStatus")
        .value =
        event.status;


    document
        .getElementById("eventCost")
        .value =
        event.cost ?? "";


    document
        .getElementById("playerLimit")
        .value =
        event.player_limit ?? "";


    document
        .getElementById("eventNotes")
        .value =
        event.notes ?? "";


    eventMessage.textContent = "";

    eventModal.classList.remove("hidden");

}



/* ========================================
   SAVE EVENT
======================================== */

eventForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        eventMessage.textContent =
            "Saving...";


        const id =
            document
                .getElementById("eventId")
                .value;


        const eventData = {

            title:
                document
                    .getElementById("eventTitle")
                    .value.trim(),

            event_date:
                document
                    .getElementById("eventDate")
                    .value,

            start_time:
                document
                    .getElementById("startTime")
                    .value,

            end_time:
                document
                    .getElementById("endTime")
                    .value,

            location:
                document
                    .getElementById("eventLocation")
                    .value.trim(),

            address:
                document
                    .getElementById("eventAddress")
                    .value.trim() || null,

            status:
                document
                    .getElementById("eventStatus")
                    .value,

            cost:
                getOptionalNumber("eventCost"),

            player_limit:
                getOptionalInteger("playerLimit"),

            notes:
                document
                    .getElementById("eventNotes")
                    .value.trim() || null

        };


        let error;


        if (id) {

            const response =
                await sb
                    .from("events")
                    .update(eventData)
                    .eq("id", id);

            error = response.error;

        } else {

            const response =
                await sb
                    .from("events")
                    .insert(eventData);

            error = response.error;

        }


        if (error) {

            console.error(error);

            eventMessage.textContent =
                "Unable to save event.";

            return;
        }


        eventModal.classList.add("hidden");

        await loadAdminEvents();

    }
);



/* ========================================
   CANCEL / REOPEN
======================================== */

async function toggleCanceled(event) {

    const newStatus =
        event.status === "Canceled"
            ? "Open"
            : "Canceled";


    const { error } =
        await sb
            .from("events")
            .update({
                status: newStatus
            })
            .eq("id", event.id);


    if (error) {

        console.error(error);

        alert(
            "Unable to update the event."
        );

        return;
    }


    loadAdminEvents();

}



/* ========================================
   DELETE
======================================== */

async function deleteEvent(event) {

    const confirmed =
        confirm(
            `Delete "${event.title}" on ${formatDate(event.event_date)}?`
        );


    if (!confirmed) {
        return;
    }


    const { error } =
        await sb
            .from("events")
            .delete()
            .eq("id", event.id);


    if (error) {

        console.error(error);

        alert(
            "Unable to delete the event."
        );

        return;
    }


    loadAdminEvents();

}



/* ========================================
   MODAL
======================================== */

function closeModal() {

    eventModal.classList.add("hidden");

}


closeModalButton.addEventListener(
    "click",
    closeModal
);


cancelModalButton.addEventListener(
    "click",
    closeModal
);


eventModal.addEventListener(
    "click",
    function(event) {

        if (event.target === eventModal) {
            closeModal();
        }

    }
);



/* ========================================
   HELPERS
======================================== */

function getOptionalNumber(id) {

    const value =
        document
            .getElementById(id)
            .value;

    return value === ""
        ? null
        : Number(value);

}


function getOptionalInteger(id) {

    const value =
        document
            .getElementById(id)
            .value;

    return value === ""
        ? null
        : parseInt(value, 10);

}


function formatDate(dateString) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        }
    );

}


function formatTime(time) {

    if (!time) {
        return "";
    }


    const [hours, minutes] =
        time.split(":");


    const date = new Date();

    date.setHours(
        Number(hours),
        Number(minutes)
    );


    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );

}



/* ========================================
   START
======================================== */

checkSession();
