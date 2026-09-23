async function loadSchedule() {

    const schedule = document.getElementById("schedule");

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const todayString = `${year}-${month}-${day}`;

    const { data: events, error } = await sb
        .from("events")
        .select("*")
        .gte("event_date", todayString)
        .order("event_date", { ascending: true })
        .order("start_time", { ascending: true });

    if (error) {

        console.error(error);

        schedule.innerHTML = `
            <div class="schedule-message">
                <h2>Schedule unavailable</h2>
                <p>
                    We couldn't load the schedule right now.
                    Please check back soon.
                </p>
            </div>
        `;

        return;
    }


    if (!events || events.length === 0) {

        schedule.innerHTML = `
            <div class="schedule-message">

                <h2>No Upcoming Open Gyms</h2>

                <p>
                    There are currently no upcoming
                    SHOGVB sessions scheduled.
                </p>

                <p>
                    Check back soon!
                </p>

            </div>
        `;

        return;
    }


    schedule.innerHTML = "";


    events.forEach(event => {

        const date =
            new Date(event.event_date + "T00:00:00");

        const month =
            date.toLocaleString("en-US", {
                month: "short"
            }).toUpperCase();

        const day = date.getDate();

        const weekday =
            date.toLocaleString("en-US", {
                weekday: "long"
            });


        const startTime =
            formatTime(event.start_time);

        const endTime =
            formatTime(event.end_time);


        const card =
            document.createElement("div");

        card.className = "event-card";


        if (event.status === "Canceled") {
            card.classList.add("event-canceled");
        }

        if (event.status === "Full") {
            card.classList.add("event-full");
        }


        card.innerHTML = `

            <div class="event-date">

                <span class="month">
                    ${month}
                </span>

                <span class="day">
                    ${day}
                </span>

            </div>


            <div class="event-info">

                <div class="event-title-row">

                    <h2>
                        ${escapeHTML(event.title)}
                    </h2>

                    <span class="
                        status-badge
                        status-${event.status.toLowerCase()}
                    ">
                        ${escapeHTML(event.status)}
                    </span>

                </div>


                <p class="event-weekday">
                    ${weekday}
                </p>


                <p>
                    <strong>Time:</strong>
                    ${startTime} – ${endTime}
                </p>


                <p>
                    <strong>Location:</strong>
                    ${escapeHTML(event.location)}
                </p>


                ${
                    event.cost !== null
                    ? `
                    <p>
                        <strong>Cost:</strong>
                        $${Number(event.cost).toFixed(2)}
                    </p>
                    `
                    : ""
                }


                ${
                    event.player_limit
                    ? `
                    <p>
                        <strong>Player Limit:</strong>
                        ${event.player_limit}
                    </p>
                    `
                    : ""
                }


                ${
                    event.notes
                    ? `
                    <p class="event-notes">
                        ${escapeHTML(event.notes)}
                    </p>
                    `
                    : ""
                }

            </div>
        `;


        schedule.appendChild(card);

    });

}


function formatTime(time) {

    if (!time) {
        return "";
    }

    const [hours, minutes] = time.split(":");

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


function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    const div =
        document.createElement("div");

    div.textContent =
        String(value);

    return div.innerHTML;
}


loadSchedule();
