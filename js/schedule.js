/* =========================================
   SHOGVB SCHEDULE
========================================= */

async function loadSchedule() {

    const schedule =
        document.getElementById("schedule");

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    const todayString =
        `${year}-${month}-${day}`;


    const { data: events, error } =
        await sb
            .from("events")
            .select("*")
            .gte(
                "event_date",
                todayString
            )
            .order(
                "event_date",
                {
                    ascending: true
                }
            )
            .order(
                "start_time",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(error);

        schedule.innerHTML = `
            <div class="schedule-message">

                <h2>
                    Schedule unavailable
                </h2>

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

                <h2>
                    No Upcoming Open Gyms
                </h2>

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
            new Date(
                event.event_date +
                "T00:00:00"
            );


        const month =
            date.toLocaleString(
                "en-US",
                {
                    month: "short"
                }
            ).toUpperCase();


        const day =
            date.getDate();


        const weekday =
            date.toLocaleString(
                "en-US",
                {
                    weekday: "long"
                }
            );


        const startTime =
            formatTime(
                event.start_time
            );


        const endTime =
            formatTime(
                event.end_time
            );


        const card =
            document.createElement("div");


        card.className =
            "event-card";


        if (
            event.status ===
            "Canceled"
        ) {

            card.classList.add(
                "event-canceled"
            );

        }


        if (
            event.status ===
            "Full"
        ) {

            card.classList.add(
                "event-full"
            );

        }


        /* =====================================
           ADDRESS / DIRECTIONS
        ===================================== */

        let addressHTML = "";


        if (event.address) {

            const safeAddress =
                escapeHTML(
                    event.address
                );


            const mapsURL =
                "https://www.google.com/maps/search/?api=1&query=" +
                encodeURIComponent(
                    event.address
                );


            addressHTML = `

                <p>
                    <strong>
                        Address:
                    </strong>

                    ${safeAddress}
                </p>


                <p class="directions-row">

                    <a
                        href="${mapsURL}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="directions-link"
                    >
                        📍 Get Directions
                    </a>

                </p>

            `;

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
                        ${escapeHTML(
                            event.title
                        )}
                    </h2>


                    <span
                        class="
                            status-badge
                            status-${event.status.toLowerCase()}
                        "
                    >
                        ${escapeHTML(
                            event.status
                        )}
                    </span>

                </div>


                <p class="event-weekday">
                    ${weekday}
                </p>


                <p>
                    <strong>
                        Time:
                    </strong>

                    ${startTime}
                    –
                    ${endTime}
                </p>


                <p>
                    <strong>
                        Location:
                    </strong>

                    ${escapeHTML(
                        event.location
                    )}
                </p>


                ${addressHTML}


                ${
                    event.cost !== null
                    && event.cost !== undefined

                    ? `
                        <p>
                            <strong>
                                Cost:
                            </strong>

                            $${Number(
                                event.cost
                            ).toFixed(2)}
                        </p>
                    `

                    : ""
                }


                ${
                    event.player_limit

                    ? `
                        <p>
                            <strong>
                                Player Limit:
                            </strong>

                            ${event.player_limit}
                        </p>
                    `

                    : ""
                }


                ${
                    event.notes

                    ? `
                        <p class="event-notes">
                            ${escapeHTML(
                                event.notes
                            )}
                        </p>
                    `

                    : ""
                }

            </div>

        `;


        schedule.appendChild(
            card
        );

    });

}



/* =========================================
   FORMAT TIME
========================================= */

function formatTime(time) {

    if (!time) {
        return "";
    }


    const [hours, minutes] =
        time.split(":");


    const date =
        new Date();


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



/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(value);


    return div.innerHTML;

}



/* =========================================
   LOAD PUBLIC SCHEDULE
========================================= */

loadSchedule();



/* =========================================
   MONTHLY CALENDAR
========================================= */

let calendarDate =
    new Date();


let calendarEvents =
    [];



/* =========================================
   LOAD CALENDAR EVENTS
========================================= */

async function loadCalendarEvents() {

    const { data, error } =
        await sb
            .from("events")
            .select("*")
            .order(
                "event_date",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Calendar error:",
            error
        );

        return;

    }


    calendarEvents =
        data || [];


    renderCalendar();

}



/* =========================================
   RENDER CALENDAR
========================================= */

function renderCalendar() {

    const calendarDays =
        document.getElementById(
            "calendarDays"
        );


    const calendarMonth =
        document.getElementById(
            "calendarMonth"
        );


    if (
        !calendarDays ||
        !calendarMonth
    ) {

        return;

    }


    calendarDays.innerHTML =
        "";


    const year =
        calendarDate.getFullYear();


    const month =
        calendarDate.getMonth();



    /* =====================================
       MONTH HEADING
    ===================================== */

    calendarMonth.textContent =
        calendarDate.toLocaleDateString(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        );



    /* =====================================
       FIRST DAY OF MONTH
    ===================================== */

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();



    /* =====================================
       NUMBER OF DAYS
    ===================================== */

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();



    /* =====================================
       EMPTY CELLS
    ===================================== */

    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "calendar-day empty";


        calendarDays.appendChild(
            empty
        );

    }



    /* =====================================
       ACTUAL DAYS
    ===================================== */

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const cell =
            document.createElement(
                "div"
            );


        cell.className =
            "calendar-day";


        const dayNumber =
            document.createElement(
                "div"
            );


        dayNumber.className =
            "calendar-day-number";


        dayNumber.textContent =
            day;


        cell.appendChild(
            dayNumber
        );



        /* =================================
           CHECK FOR TODAY
        ================================= */

        const today =
            new Date();


        if (
            day ===
                today.getDate() &&

            month ===
                today.getMonth() &&

            year ===
                today.getFullYear()
        ) {

            cell.classList.add(
                "today"
            );

        }



        /* =================================
           CREATE YYYY-MM-DD
        ================================= */

        const monthNumber =
            String(
                month + 1
            ).padStart(
                2,
                "0"
            );


        const dayNumberString =
            String(
                day
            ).padStart(
                2,
                "0"
            );


        const dateString =
            `${year}-${monthNumber}-${dayNumberString}`;



        /* =================================
           FIND EVENTS FOR THIS DAY
        ================================= */

        const eventsForDay =
            calendarEvents.filter(
                event =>
                    event.event_date ===
                    dateString
            );



        /* =================================
           ADD EVENTS TO CALENDAR
        ================================= */

        eventsForDay.forEach(
            event => {

                const eventElement =
                    document.createElement(
                        "div"
                    );


                eventElement.className =
                    "calendar-event";


                if (
                    event.status ===
                    "Canceled"
                ) {

                    eventElement
                        .classList
                        .add(
                            "canceled"
                        );

                }


                eventElement.textContent =
                    `${formatTime(
                        event.start_time
                    )} ${event.title}`;



                /* =========================
                   EVENT TOOLTIP
                ========================= */

                let tooltip =
                    `${event.title}\n` +
                    `${formatTime(
                        event.start_time
                    )} - ${formatTime(
                        event.end_time
                    )}\n` +
                    `${event.location}`;


                if (event.address) {

                    tooltip +=
                        `\n${event.address}`;

                }


                if (
                    event.cost !== null &&
                    event.cost !== undefined
                ) {

                    tooltip +=
                        `\nCost: $${Number(
                            event.cost
                        ).toFixed(2)}`;

                }


                tooltip +=
                    `\nStatus: ${event.status}`;


                eventElement.title =
                    tooltip;



                /* =========================
                   CLICK CALENDAR EVENT
                   FOR DIRECTIONS
                ========================= */

                if (event.address) {

                    eventElement.style.cursor =
                        "pointer";


                    eventElement.addEventListener(
                        "click",
                        function() {

                            const mapsURL =
                                "https://www.google.com/maps/search/?api=1&query=" +
                                encodeURIComponent(
                                    event.address
                                );


                            window.open(
                                mapsURL,
                                "_blank",
                                "noopener,noreferrer"
                            );

                        }
                    );

                }


                cell.appendChild(
                    eventElement
                );

            }
        );


        calendarDays.appendChild(
            cell
        );

    }

}



/* =========================================
   PREVIOUS MONTH
========================================= */

document
    .getElementById(
        "previousMonth"
    )
    ?.addEventListener(
        "click",
        function() {

            calendarDate.setMonth(
                calendarDate.getMonth() - 1
            );


            renderCalendar();

        }
    );



/* =========================================
   NEXT MONTH
========================================= */

document
    .getElementById(
        "nextMonth"
    )
    ?.addEventListener(
        "click",
        function() {

            calendarDate.setMonth(
                calendarDate.getMonth() + 1
            );


            renderCalendar();

        }
    );



/* =========================================
   START CALENDAR
========================================= */

loadCalendarEvents();
