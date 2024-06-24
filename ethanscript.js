/*
    NOTES:
    Event Data is passed in webflow on "Calendar/Events CMS" page via collection list item 
    Collection List 25. Here all event data fields are linked and exported to the page and listed in the oreder they apear in webflow under <div class="collection-list-wrapper-25 w-dyn-list">.....
  */
/*Task Class
   This is the class object created to store the data of our Events in an object.
   It contains start date, name, description, end date, and optionally image src. The class has a simple constructor, and getters 
   for all variables. And a setter for an index.
   */
class Task {
    constructor(name = "", desc = "", date = "", endDate = "", imgSrc = "", startTime = "", endTime = "", key = "") {
        //all vars are strings
        this.name = name
        this.date = date
        this.endDate = endDate
        this.desc = desc
        this.imgSrc = imgSrc
        this.startTime = startTime
        this.endTime = endTime
        this.key = key
    }
    getName() {
        return this.name
    }
    getDate() {
        return this.date
    }
    getEndDate() {
        return this.endDate
    }
    getDesc() {
        return this.desc
    }
    getImgSrc() {
        return this.imgSrc
    }
    getKey() {
        return this.key
    }
    getStartTime() {
        return this.startTime
    }
    getEndTime() {
        return this.endTime
    }
    setKey(key) {
        this.key = key
    }
}//end task class
//global variables
const calendarDays = document.querySelector('.calendar-days');
const monthPicker = document.getElementById('month-picker');
const yearSpan = document.getElementById('year');
const currentDate = new Date();
var currentYear = currentDate.getFullYear();
var currentMonth = currentDate.getMonth();
var today = currentDate.getDate();
var currentDateShort = currentYear + "-" + (currentMonth + 1) + "-" + today
var currentEventIndex = 0;
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var currentMonthEvents = [];
var currentMonthTasks = [];
const allEvents = document.querySelectorAll('.events .event');



//page load functions
//Loads current month grid, closet event to current date into Event view, and determines all tasks that should exist on the current month
document.addEventListener('DOMContentLoaded', function () {
    //function calls to initialize calendar
    generateCurrentMonthEvents(allEvents, currentMonth, currentYear) //populates currentMonthEvents, and currentMonthTasks arrays
    currentMonthTasks = heapSort(currentMonthTasks)
    let temp = months[currentMonth] + " " + today + ", " + currentYear
    generateCalendar(currentMonth, currentYear);
    calcGridBoxHeight(currentYear, currentMonth) //calculates day grid height to fit within 700px
    generateDetailedView(getClosestEvent(temp, currentMonthTasks)) //get closest task to current date as of calendar loading and place in detailed view
});
//indexes month backward and recalls associated functions to setup calendar
document.getElementById('prev-year').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCurrentMonthEvents(allEvents, currentMonth, currentYear)
    currentMonthTasks = heapSort(currentMonthTasks)
    generateCalendar(currentMonth, currentYear);
    calcGridBoxHeight(currentYear, currentMonth) //calculates day grid height to fit within 700px
    let temp = months[currentMonth] + " 1, " + currentYear
    generateDetailedView(getClosestEvent(temp, currentMonthTasks))
});
//indexes month foward and recalls associated functions to setup calendar
document.getElementById('next-year').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCurrentMonthEvents(allEvents, currentMonth, currentYear)
    currentMonthTasks = heapSort(currentMonthTasks)
    generateCalendar(currentMonth, currentYear);
    calcGridBoxHeight(currentYear, currentMonth) //calculates day grid height to fit within 700px
    let temp = months[currentMonth] + " 1, " + currentYear
    generateDetailedView(getClosestEvent(temp, currentMonthTasks))
});
//loads previous event chronologically into detailed view (if more than one exists). This function can also loop on this array
document.getElementById('prev-event').addEventListener('click', () => {
    if (currentMonthTasks.length == 0) { return }
    if (currentEventIndex == 0) {
        currentEventIndex = currentMonthTasks.length - 1
        generateDetailedView(currentMonthTasks[currentEventIndex])
        return
    }
    else {
        currentEventIndex--;
        generateDetailedView(currentMonthTasks[currentEventIndex])
    }
});
//loads next event chronologically into detailed view (if more than one exists). This function can also loop on this array
document.getElementById('next-event').addEventListener('click', () => {
    if (currentMonthTasks.length == 0) { return }
    currentEventIndex++;
    if (currentEventIndex <= currentMonthTasks.length - 1) {
        generateDetailedView(currentMonthTasks[currentEventIndex])
    }
    else {
        currentEventIndex = 0;
        generateDetailedView(currentMonthTasks[currentEventIndex])
    }
});
//------------------------------------------------------------------------------------------------------------------------FUNCTIONS--------------------------------------------------------------------------------------------------------
//generates current month and year monthview calendar grid. Correctly places nxt and prev month days when applicable
//PARAMETERS: month: current month index (zero indexed int) year: full year# (int) ex. 2024
//RETURN: NONE
function generateCalendar(month, year) {
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]
    const monthDays = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInLastMonth = new Date(year, month, 0).getDate();
    monthPicker.innerText = months[month];
    yearSpan.innerText = year.toString();
    currentMonthEvents = [];// Reset event references on each calendar generation
    let totalDays = firstDayIndex + monthDays
    let rowCount = Math.ceil(totalDays / 7)
    const monthGrid = document.getElementById("calendar-days");
    monthGrid.innerHTML = "";
    let idMonth = 0
    let idYear = year
    // let weekDiv = document.createElement('div') //week div to contain 7 days
    //weekDiv.id = `week-${weekNum}`
    //weekDiv.classList.add("week-conatiner-div")
    //let weekNum = 0 //number of week
    for (let i = 0; i < rowCount * 7; i++) {
        /*
        if(i % 7 == 0 && i !== 0){
            monthGrid.append(weekDiv)
            weekDiv = document.createElement('div')
            weekDiv.id = `week-${weekNum}`
            weekDiv.classList.add("week-conatiner-div")
            weekNum++
        }
        */
        const dayOfMonth = i - firstDayIndex + 1;
        const dayElement = document.createElement("div")
        dayElement.classList.add("calendar-day")
        //if statment checks if the day shold be part of the next month or previous month
        //create previous and next month days
        if (i < firstDayIndex || dayOfMonth > monthDays) {
            //edge case in january to prevent last month decemeber days having a month of zero and current year
            if (month == 0 && dayOfMonth < monthDays) {
                idMonth = 12;
                idYear = year - 1
            }
            //edge case in decemeber that indexes january days as month 1 and a year ahead
            else if (month == 11 && dayOfMonth > monthDays) {
                idMonth = 1
                idYear = year + 1
            }
            //we want all days after prev + current month to be indexed forward one month as they're in nxt month
            else if (i == totalDays) {
                idMonth = month + 2
                idYear = year
            }
            //prev month day: normal month number; which is already correct # bc of zero index
            else if (i < totalDays) {
                idMonth = month
                idYear = year
            }
            dayElement.classList.add("inactive")
            dayElement.id = `${idYear}-${idMonth}-${dayOfMonth <= 0 ? daysInLastMonth + dayOfMonth : dayOfMonth - monthDays}`
            let dayNum = document.createElement("div")
            dayNum.id = `monthview-daynum-${dayOfMonth <= 0 ? daysInLastMonth + dayOfMonth : dayOfMonth - monthDays}`
            dayNum.innerText = dayOfMonth <= 0 ? daysInLastMonth + dayOfMonth : dayOfMonth - monthDays
            dayElement.appendChild(dayNum)
        } else { //day grid box is part of current month
            //set id month foward one accounting for zero index of month variable
            idMonth = month + 1
            idYear = year
            dayElement.id = `${idYear}-${idMonth}-${dayOfMonth}`
            let dayNum = document.createElement("div")
            dayNum.id = `monthview-daynum-${dayOfMonth}`
            dayNum.innerText = dayOfMonth
            if (dayElement.id == currentDateShort) {
                dayNum.classList.add("currentDateNum")
            }

            dayElement.appendChild(dayNum)
        }
        monthGrid.appendChild(dayElement)
        //weekDiv.appendChild(dayElement)
    }//end for
    placeEvents(currentMonthTasks)
}//end function generate calendar

//PARAMETERS: eventTask: Task class object
//RETURN:NONE
//function generates divs for current event's data in the detailedview; function is passed current event to display as Task class object; function has no return
function generateDetailedView(eventTask) {
    //places text in detailed view if no tasks exist in current month
    if (eventTask.getName() === "There are currently no events to display") {
        var parentDiv = document.getElementById('detailedview-event-details')//the parent div where all info will be appended
        parentDiv.innerHTML = "" //clear previous content
        var titleDiv = document.createElement("div")
        titleDiv.classList.add("detailedview-title-noEvents")
        titleDiv.id = "detailedview-title-noEvents"
        titleDiv.innerHTML = eventTask.getName()

        parentDiv.appendChild(titleDiv)
        return
    }
    //normal event placing operation
    var mergedDateStr = mergeStart_EndDates(eventTask.getDate(), eventTask.getEndDate(), eventTask.getStartTime(), eventTask.getEndTime())
    //creating divs for each element of the Current Event (img optional currently 6/12/24)

    var parentDiv = document.getElementById('detailedview-event-details')
    parentDiv.innerHTML = ""
    var titleDiv = document.createElement("div")
    titleDiv.classList.add("detailedview-title")
    titleDiv.id = "detailedview-title"
    titleDiv.innerHTML = eventTask.getName()

    var dateDiv = document.createElement("div")
    dateDiv.classList.add("detailedview-date")
    dateDiv.id = "detailedview-date"
    dateDiv.innerHTML = mergedDateStr

    //line section break for above and below Description
    var lineBreak = document.createElement("div")
    lineBreak.classList.add("section-break")
    var lineBreak2 = document.createElement("div")
    lineBreak2.classList.add("section-break") //not currently used

    var descTitle = document.createElement("div")
    descTitle.id = "detailedview-desc-title"
    descTitle.appendChild(document.createTextNode("Description:"))

    //appending children in order we want them to appear
    parentDiv.appendChild(dateDiv)
    parentDiv.appendChild(titleDiv)
    //if the event has no image, the Task object will hold "" under image source. (this applies to all fields that are empty)
    //If this is the case, the event view will not append an image div 
    if (eventTask.getImgSrc() != "") {
        var imgDiv = document.createElement("img")
        imgDiv.classList.add("detailedview-img")
        imgDiv.id = "detailedview-img"
        imgDiv.src = eventTask.getImgSrc()
        parentDiv.appendChild(imgDiv)
    }

    if (eventTask.getDesc() !== "") {
        parentDiv.appendChild(lineBreak)
        parentDiv.appendChild(descTitle)
        var descDiv = document.createElement("div")
        descDiv.classList.add("detailedview-desc")
        descDiv.id = "detailedview-desc"
        descDiv.innerHTML = eventTask.getDesc()
        parentDiv.appendChild(descDiv)
    }
    //parentDiv.appendChild(lineBreak2)
}

//This function also updates current EventIndex to be the index of returned TASK
//PARAMETERS: matchDate is a str of format "May 1, 2024"; list is the collection of current month events as Task objects
//RETURN: function returns Event with closest start date to passed matchDate
function getClosestEvent(matchDate, list) {
    var closestTSK = list[0]
    if (list.length == 0) {
        var emptyTSK = new Task("There are currently no events to display")
        return emptyTSK
    }
    for (let i = 0; i < list.length; i++) {
        if (matchDate == list[i].getDate()) {
            return list[i]
        }
        else if (Math.abs(Date.parse(matchDate) - Date.parse(closestTSK.getDate())) > Math.abs(Date.parse(matchDate) - Date.parse(list[i].getDate()))) {
            closestTSK = list[i]
            currentEventIndex = i
        }
    }
    return closestTSK
}//end func getClosestEvent

//PARAMETERS: allEventsArr: collection list of all divs containing event data; month: current Month Index (zero indexed) (int); year: year# (int)
//RETURN: NONE
//function decides which months should be added to array currentMonthTasks, and pushes them to the array for the passed current date (currentMonth, currentYear)
function generateCurrentMonthEvents(allEventsArr, month, year) {
    if (allEventsArr.length === 0) {
        return
    }
    currentMonthEvents = []
    currentMonthTasks = []
    for (let i = 0; i < allEventsArr.length; i++) {
        let startYear = parseYear(allEventsArr[i].querySelector(".date").textContent)
        let endYear = parseYear(allEventsArr[i].querySelector(".end-date").textContent)
        let startMonth = parseMonth(allEventsArr[i].querySelector(".date").textContent)
        let endMonth = parseMonth(allEventsArr[i].querySelector(".end-date").textContent)
        let startDay = parseDay(allEventsArr[i].querySelector(".date").textContent)
        let endDay = parseDay(allEventsArr[i].querySelector(".end-date").textContent)
        let startMonthNum = new Date(`${startMonth} ${startDay}, ${startYear}`)
        startMonthNum = startMonthNum.getMonth() + 1
        let endMonthNum = new Date(`${endMonth} ${endDay}, ${endYear}`)
        endMonthNum = endMonthNum.getMonth() + 1
        let startTime = parseTime(allEventsArr[i].querySelector(".start-time").textContent)
        let endTime = parseTime(allEventsArr[i].querySelector(".end-time").textContent)
        let eventOnPage = false
        let totalDays = 0
        totalDays = getTotalDays(startYear, month + 1)
        let firstDayIndEndMonth = new Date(`${endMonth} 1, ${endYear}`).getDay()
        let firstOfCurMonthInd = new Date(`${year}-${month + 1}-1`).getDay()
        let daysInCurentMonth = new Date(year, month + 1, 0).getDate()
        let daysInLastMonth = new Date(year, month, 0).getDate()
        let daysFromLastMonth = 0 //initialize
        //edge case first of next month is zero (else condition), then the component Math.abs should be zero, (if condtion) we want difference
        if (firstDayIndEndMonth !== 0) {
            daysFromLastMonth = totalDays - daysInCurentMonth - Math.abs(7 - firstDayIndEndMonth)
        }
        else {
            daysFromLastMonth = totalDays - daysInCurentMonth
        }

        let startDayNum = parseInt(startDay) + daysInCurentMonth + daysFromLastMonth

        let startDate = new Date(`${startYear}-${startMonthNum}-1`).getTime()//event start date as first of month (for CASE 3 events w/ monthDiff > 3)
        let endDate = new Date(`${endYear}-${endMonthNum}-1`).getTime()//event end date as first of month (for CASE 3 events w/ monthDiff > 3)
        let compareDate = new Date(`${year}-${month + 1}-1`).getTime()//current month and year as a date obj (for CASE 3 event comparison)
        var monthDiff = Math.abs(Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 7 * 4)))//difference in #months between event start and end months

        //if event is on page && from next month exclusively && same year || month+1 == 12 && startMonth == 1 && year+1 == startYear && next Month exclusively -> then eventOnPage=true
        if (startDayNum <= totalDays && (startMonthNum == month + 2 && parseInt(startYear) == year && startMonth == endMonth || month + 1 == 12 && startMonthNum == 1 && year + 1 == parseInt(startYear) && startMonth == endMonth)) {
            eventOnPage = true
        }
        else if (firstOfCurMonthInd != 0 && startMonthNum == month && parseInt(startYear) == year && startMonth == endMonth) {
            let firstDayLastMonth = daysInLastMonth - firstOfCurMonthInd + 1
            if (parseInt(startDay) >= firstDayLastMonth || parseInt(endDay) >= firstDayLastMonth) { eventOnPage = true }
        }
        //this if places correct events in the current month
        if (startMonth === months[month] && parseInt(startYear) === year || endMonth === months[month] && parseInt(endYear) === year
            || startMonthNum == month && endMonthNum == startMonthNum && parseInt(startYear) === year && eventOnPage
            || startMonthNum == month + 2 && startMonthNum == endMonthNum && parseInt(endYear) == year && eventOnPage
            || month == 11 && eventOnPage && startMonthNum == 1 && year + 1 == startYear
            || monthDiff >= 2 && compareDate >= startDate && compareDate <= endDate) {
            currentMonthEvents.push(allEventsArr[i])
            let title = allEventsArr[i].querySelector(".event-name").textContent
            let desc = ""
            if (allEventsArr[i].querySelector(".event-description").innerHTML !== "") {
                try {
                    desc = allEventsArr[i].querySelector(".event-description").getElementsByTagName('p')[0].innerText
                } catch (error) {
                    desc = allEventsArr[i].querySelector(".event-description").innerText
                }
            }

            let startDate = allEventsArr[i].querySelector(".date").textContent
            let endDate = allEventsArr[i].querySelector(".end-date").textContent
            let imgSrc = allEventsArr[i].querySelector(".event-image").src
            //making image element optional
            //query selector should return null when no div is found
            if (imgSrc === "https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg" || imgSrc == null) {
                imgSrc = ""
            }

            if (startTime === -1) {
                //edge case checking that parseTime did not return error or that the event sent no time field
                startTime = ""
            }

            if (endTime === -1) {
                //edge case checking that parseTime did not return error
                endTime = ""
            }
            let tmpTask = new Task(title, desc, startDate, endDate, imgSrc, startTime, endTime, - 1)//creates event as Task Object
            currentMonthTasks.push(tmpTask)
        }
    }//end for
}//end generateCurrentMonthEvents

//PARAMETERS: events: array of current month events as Task class objects (currentMonthTasks) 
//RETURN: NONE
//function is passed monthEventsTasks; uses data within task objects to populate monthview Tasks
/*
General EXPLANATION:
    This is a rather complex function that should arguably be split into many sub functions, but it was built the way it is for 
    a quick development time, and because this was a very complex task and this was my approach to solve it.

    Each task in month view is represented with a banner that has a "on click" link to that event to be viewed in detailed view

    The function has 5 cases that determine which path an event takes for placement on the monthview grid. Once the program decides
    which case the current event falls into, it creates event banner dates, divs to actually display said divs, and monthview blanks. These components
    are then placed at the end of the function by the for loop with "//place banners" above it. In that for loop is also the logic that decides how many Events can be
    placed on any given day(currently set at 2).

    EVENT CASES

    case 1: 
    Event is a single day event or spans at most a single row in the month. 
    -must starts and end in same month

    case 2: 
    Event is a multi-row event that spans only within the same month
    -must start and end in same month

    CASE 1:
    Event is single or multi row event that spans from the previous month into the current month
    -must start in previous month and end in current month
    -accounts for year boundaries 

    CASE 2:
    Event is single or multi row event that spans from the current month into the next month
    -must start in current month and end in next month
    -accounts for year boundaries

    CASE 3:
    Event spans 3 or more months including the start month ex. june-august, december-march
    This case is broken down into 3 sub cases for the starting, middle, and end months of the respective event
    
    BEGIN MONTH
    -event is CASE 3 and we are in this events starting month
    -accounts for year boundaries

    MIDDLE MONTH
    -event is CASE 3 and we are inbetween this events starting month and end month exclusively
    -accounts for year boundaries
    -accounts for edge case of event ending on middle month page. ex. 12/31/2026 - 02/01/2027 (when viewed in a standard U.S. Monthview calendar)

    END MONTH
    -event is CASE 3 and we are in this events end month
    -accounts for year boundaries

    Theoretically The CASE 3 can support multi-year events, but this has not been tested as of 06/12/2024

*/
function placeEvents(events) {
    //there are no events to place on calendar
    if (events.length === 0) {
        return
    }
    let name = ""
    let date = ""
    for (let i = 0; i < events.length; i++) {
        let addTask = true
        let extraTaskBool = false
        let tmpTask = events[i]
        const date = assembleMonthViewDateStr(tmpTask.getDate()) //reformats date str
        let name = tmpTask.getName()
        let eventKey = tmpTask.getKey() //current event's unique key
        //if id date matches a calendar grid element && the task does not exist on the page, 
        let parent = document.getElementById(date)
        let extraTaskElem = null

        let currentEventBannerDivs = []   //holds each banner div (formatted with specific length)
        let currentEventBlankDivsDates = [] //holds dates for blank div placement
        let currentEventBannerDates = [] //Arr holds starting date placement of each banner for current event

        var startDay = parseDay(events[i].getDate())
        var endDay = parseDay(events[i].getEndDate())
        var startMonth = parseMonth(events[i].getDate())
        var endMonth = parseMonth(events[i].getEndDate())
        var startYear = parseYear(events[i].getDate())
        var endYear = parseYear(events[i].getEndDate())

        let startMonthNum = new Date(`${startMonth} ${startDay}, ${startYear}`)
        startMonthNum = startMonthNum.getMonth() + 1
        let endMonthNum = new Date(`${endMonth} ${endDay}, ${endYear}`)
        endMonthNum = endMonthNum.getMonth() + 1

        //used for CASE 3 month comparison
        let startDateMonthOBJ = new Date(`${startYear}-${startMonthNum}-1`).getTime()//event start date as first of month (for CASE 3 events w/ monthDiff > 3)
        let endDateMonthOBJ = new Date(`${endYear}-${endMonthNum}-1`).getTime()//event end date as first of month (for CASE 3 events w/ monthDiff > 3)
        let currentDateMonthOBJ = new Date(`${currentYear}-${currentMonth + 1}-1`).getTime()//current month and year as a date obj (for CASE 3 event comparison)
        var monthDiff = Math.abs(Math.round((endDateMonthOBJ - startDateMonthOBJ) / (1000 * 60 * 60 * 24 * 7 * 4)))//difference in #months between event start and end months
        //case 1 span same row in same month/year (multiday and single day)
        //if event exists on same row of month and same month and year || event exists on same month grid, but is exclusively in prev/nxt month (first or last row only) || edge case december to january last row event (exists only in jan)
        if ((getRowOfDate(startMonth, startDay, startYear) == getRowOfDate(endMonth, endDay, endYear) && (startMonth === endMonth) && (startYear === endYear) && currentMonth == startMonthNum - 1)
            || (currentMonth + 2 == startMonthNum && document.getElementById(`${startYear}-${startMonthNum}-${startDay}`) != null && parseInt(startYear) == currentYear) && startMonth == endMonth
            || (currentMonth == startMonthNum && document.getElementById(`${startYear}-${endMonthNum}-${endDay}`) != null && parseInt(startYear) == currentYear && startMonth == endMonth)
            || (endMonthNum == 1 && currentMonth == 11 && document.getElementById(`${startYear}-${startMonthNum}-${startDay}`) != null && parseInt(startYear) == currentYear + 1) && startMonth == endMonth) {
            let daysInLastMonth = new Date(parseInt(startYear), currentMonth, 0).getDate()
            let firstOfCurMonthInd = new Date(`${startYear}-${currentMonth + 1}-1`).getDay()
            let firstDayLastMonth = daysInLastMonth - firstOfCurMonthInd + 1
            //formats multi-day banner
            //alt width calc for edge case nxt month exclusive event
            if ((currentMonth + 2 == startMonthNum && document.getElementById(`${startYear}-${startMonthNum}-${startDay}`) != null && parseInt(startYear) == currentYear) && startMonth == endMonth
                || (endMonthNum == 1 && currentMonth == 11 && document.getElementById(`${startYear}-${startMonthNum}-${startDay}`) != null && parseInt(startYear) == currentYear + 1) && startMonth == endMonth) {
                let saveEndD = endDay
                //if end day is not on page, find last day in nxt month that is on page
                if (document.getElementById(`${startYear}-${startMonthNum}-${endDay}`) == null) {
                    for (let i = startDay; i < saveEndD; i++) {
                        if (document.getElementById(`${startYear}-${startMonthNum}-${i}`) != null) {
                            endDay = i
                        }
                        else {
                            break
                        }
                    }
                }
            }
            //case prev month exclusive month
            else if (document.getElementById(`${startYear}-${startMonthNum}-${startDay}`) == null) {
                startDay = firstDayLastMonth
            }
            var tempDiv = document.createElement('div')
            tempDiv.classList.add("task")
            tempDiv.id = name
            tempDiv.innerHTML = name
            if (searchEventTasks(events, eventKey) != -1) {
                tempDiv.addEventListener('click', () => { generateDetailedView(events[searchEventTasks(events, eventKey)]) })
            }
            else {
                console.log("Error placing event lister on event: func placeEvents")
            }
            calcBannerWidth(tempDiv, Math.abs(startDay - endDay) + 1)//calculates banner width by total days spanned
            currentEventBannerDivs.push(tempDiv)
            currentEventBannerDates.push(`${startYear}-${startMonthNum}-${startDay}`)

            //must also place blank placeholder events on days where first event exists
            if (startDay != endDay) {
                for (let i = parseInt(startDay) + 1; i <= endDay; i++) {
                    currentEventBlankDivsDates.push(`${startYear}-${startMonthNum}-${i}`)
                }
            }//end if
        }//end case 1

        //case 2 span multiple rows in same month/year
        else if ((getRowOfDate(startMonth, startDay, startYear) != getRowOfDate(endMonth, endDay, endYear)) && (startMonth === endMonth) && (startYear === endYear) && currentMonth == startMonthNum - 1) {
            let currentRow = getRowOfDate(startMonth, startDay, startYear)
            let breakPTArr = [] //array of break point days; stores day(s) of month where next row starts
            let breakInd = 0 //index 0 is the first breakpt to next row
            let spanNextRow = [] //array to hold last day of event spanning banner in 1 row; stores day(s) before row ends
            let spanInd = 0
            //find breakpoint day
            for (let i = parseInt(startDay) + 1; i <= parseInt(endDay); i++) {
                let a = getRowOfDate(startMonth, i, startYear)
                if (a != currentRow && a != -1) {
                    breakPTArr[breakInd] = i
                    spanNextRow[spanInd] = i - 1
                    spanInd++
                    breakInd++
                    currentRow++
                }
            }//end for

            //assembling banners & blanks & dates array
            //breakInd and SpanInd should always be equal
            for (let i = 0; i < breakInd; i++) {
                //0th row
                if (i == 0) {
                    //creating title div for monthview task
                    var tempDiv = document.createElement('div')
                    tempDiv.classList.add("task")
                    tempDiv.id = name
                    tempDiv.innerHTML = name
                    tempDiv.addEventListener('click', () => { generateDetailedView(events[searchEventTasks(events, eventKey)]) })
                    calcBannerWidth(tempDiv, Math.abs(startDay - spanNextRow[i]) + 1)//calculates banner width by total days spanned
                    currentEventBannerDivs.push(tempDiv)

                    //adding to banner dates array (here is just start day)
                    currentEventBannerDates.push(`${startYear}-${startMonthNum}-${startDay}`)

                    //adding blank dates to blankDates array
                    if (Math.abs(startDay - spanNextRow[i]) > 0) {
                        for (let j = parseInt(startDay) + 1; j <= spanNextRow[i]; j++) {
                            currentEventBlankDivsDates.push(`${startYear}-${startMonthNum}-${j}`)
                        }
                    }
                }
                //ith row
                if (i + 1 < breakPTArr.length) {
                    //creating title div for monthview task
                    var tempDiv = document.createElement('div')
                    tempDiv.classList.add("task")
                    tempDiv.id = name
                    tempDiv.innerHTML = name
                    tempDiv.addEventListener('click', () => { generateDetailedView(events[searchEventTasks(events, eventKey)]) })
                    calcBannerWidth(tempDiv, Math.abs(spanNextRow[i + 1] - breakPTArr[i]) + 1)//calculates banner width by total days spanned
                    currentEventBannerDivs.push(tempDiv)
                    //adding to banner dates array (here is each brkPt day)
                    currentEventBannerDates.push(`${startYear}-${startMonthNum}-${breakPTArr[i]}`)

                    //adding blank dates to blankDates array
                    if (Math.abs(spanNextRow[i + 1] - breakPTArr[i]) > 0) {
                        for (let j = breakPTArr[i] + 1; j <= spanNextRow[i + 1]; j++) {
                            currentEventBlankDivsDates.push(`${startYear}-${startMonthNum}-${j}`)
                        }
                    }
                }

                //last row
                else {
                    //creating title div for monthview task
                    var tempDiv = document.createElement('div')
                    tempDiv.classList.add("task")
                    tempDiv.id = name
                    tempDiv.innerHTML = name
                    tempDiv.addEventListener('click', () => { generateDetailedView(events[searchEventTasks(events, eventKey)]) })
                    calcBannerWidth(tempDiv, Math.abs(endDay - breakPTArr[i]) + 1)//calculates banner width by total days spanned
                    currentEventBannerDivs.push(tempDiv)


                    //adding to banner dates array (here is last brkPt day)
                    currentEventBannerDates.push(`${startYear}-${startMonthNum}-${breakPTArr[i]}`)

                    //pushing blank dates into blankDates array
                    if (Math.abs(endDay - breakPTArr[i]) > 0) {
                        for (let j = breakPTArr[i] + 1; j <= endDay; j++) {
                            currentEventBlankDivsDates.push(`${startYear}-${startMonthNum}-${j}`)
                        }
                    }
                }
            }//end assembling banners for

        }//end case 2 else if

        //MULTI-MONTH EVENTS
        //CASE 1: span prev month -> current month; startMonth= not important, endMonth=currentMonth 
        //edge case span december <- January;
        else if (endMonthNum == currentMonth + 1 && Math.abs(startMonthNum - endMonthNum) == 1 && monthDiff < 2 || endMonthNum == 1 && currentMonth == 0 && monthDiff < 2) {
            let breakPTArr = [] //array of break point days; stores day(s) of month where next row starts
            let breakInd = 0 //index 0 is the first breakpt to next row
            let spanNextRow = [] //array to hold last day of event spanning banner in 1 row; stores day(s) before row ends
            let spanInd = 0
            let totalDays = 0
            let singleRowCalc = false
            totalDays = getTotalDays(endYear, endMonthNum)
            let firstDayIndCurMonth = new Date(`${endMonth} 1, ${endYear}`).getDay() //0 = sunday 6 = saturday
            let daysInCurentMonth = new Date(parseInt(endYear), endMonthNum, 0).getDate() //# of days in specified month/year
            let daysInLastMonth = new Date(parseInt(startYear), endMonthNum - 1, 0).getDate() //# of days in specified month/year
            let firstDayLastMonth = daysInLastMonth - firstDayIndCurMonth + 1 //calculates first day from last month in month view
            //curr Mon has no prevMon days
            if (document.getElementById(`${startYear}-${startMonthNum}-${daysInLastMonth}`) == null) {
                startDay = 1
                startMonthNum = endMonthNum
                startMonth = endMonth
                startYear = endYear
            }
            else if (document.getElementById(`${startYear}-${startMonthNum}-${startDay}`) == null) {
                startDay = firstDayLastMonth
            }


            let d1 = new Date(`${startYear}-${startMonthNum}-${startDay}`)
            let d2 = new Date(`${endYear}-${endMonth}-${endDay}`)
            let numDaysbtw = Math.floor(Math.abs((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)))
            let currentRow = 0 //the previous month task will always start in the first row
            //single row width calc
            if (currentRow == getRowOfDate(endMonth, endDay, endYear)) {
                //formats multi-day banner
                var tempDiv = document.createElement('div')
                tempDiv.classList.add("task")
                tempDiv.id = name
                tempDiv.innerHTML = name
                if (searchEventTasks(events, eventKey) != -1) {
                    tempDiv.addEventListener('click', () => { generateDetailedView(events[searchEventTasks(events, eventKey)]) })
                }
                else {
                    console.log("Error placing event lister on event: func placeEvents")
                }
                calcBannerWidth(tempDiv, numDaysbtw + 1)//calculates banner width by total days spanned
                currentEventBannerDivs.push(tempDiv)
                currentEventBannerDates.push(`${startYear}-${startMonthNum}-${startDay}`)

                //must also place blank placeholder events on days where first event exists
                let tempCurMonthNum = startMonthNum
                let tempCurYear = startYear
                let j = parseInt(startDay) + 1
                if (startDay != endDay && startMonth != endMonth) {
                    for (let i = 0; i <= numDaysbtw - 1; i++) {

                        if (j > daysInLastMonth) {
                            j = 1
                            tempCurMonthNum = endMonthNum
                            tempCurYear = endYear
                        }

                        currentEventBlankDivsDates.push(`${tempCurYear}-${tempCurMonthNum}-${j}`)
                        j++
                    }
                }//end if

            }//single row banner placement
            else {
                j = parseInt(startDay) + 1
                let tempCurYear = startYear
                let tempCurMonthNum = startMonthNum
                //find breakpoint day
                for (let i = 0; i < numDaysbtw; i++) {
                    if (j > daysInLastMonth) {
                        j = 1
                        tempCurYear = endYear
                        tempCurMonthNum = endMonthNum
                    }
                    let a = getRowOfDate(months[tempCurMonthNum - 1], j, tempCurYear, endYear)
                    if (a != currentRow && a != -1 && tempCurMonthNum == endMonthNum) {
                        breakPTArr[breakInd] = j
                        spanNextRow[spanInd] = j - 1
                        spanInd++
                        breakInd++
                        currentRow++
                    }
                    j++
                }//end for

                //assembling banners & blanks & dates array
                //breakInd and SpanInd should always be equal
                for (let i = 0; i < breakInd; i++) {
                    //0th row
                    if (i == 0) {
                        let a = new Date(`${startYear}-${startMonth}-${startDay}`)
                        let a1 = new Date(`${endYear}-${endMonth}-${spanNextRow[i]}`)
                        let daysBtwFirstRow = Math.abs((a1.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
                        //creating title div for monthview task
                        var tempDiv = document.createElement('div')
                        tempDiv.classList.add("task")
                        tempDiv.id = name
                        tempDiv.innerHTML = name
                        tempDiv.addEventListener('click', () => { generateDetailedView(events[searchEventTasks(events, eventKey)]) })
                        calcBannerWidth(tempDiv, daysBtwFirstRow + 1)//calculates banner width by total days spanned
                        currentEventBannerDivs.push(tempDiv)

                        //adding to banner dates array (here is just start day)
                        currentEventBannerDates.push(`${startYear}-${startMonthNum}-${startDay}`)

                        //adding blank dates to blankDates array
                        if (daysBtwFirstRow > 0) {
                            let k = parseInt(startDay) + 1
                            let tempCurMonthNum = startMonthNum
                            let tempCurYear = startYear
                            for (let j = 0; j < daysBtwFirstRow; j++) {
                                if (k > daysInLastMonth) {
                                    k = 1
                                    tempCurMonthNum = endMonthNum
                                    tempCurYear = endYear
                                }
                                currentEventBlankDivsDates.push(`${tempCurYear}-${tempCurMonthNum}-${k}`)
                                k++
                            }
                        }
                    }
                    //ith row
                    if (i + 1 < breakPTArr.length) {
                        //creating title div for monthview task
                        var tempDiv = document.createElement('div')
                        tempDiv.classList.add("task")
                        tempDiv.id = name
                        tempDiv.innerHTML = name
                        tempDiv.addEventListener('click', () => { generateDetailedView(events[searchEventTasks(events, eventKey)]) })
                        currentEventBannerDivs.push(tempDiv)
                        calcBannerWidth(tempDiv, Math.abs(spanNextRow[i + 1] - breakPTArr[i]) + 1)//calculates banner width by total days spanned
                        //adding to banner dates array (here is each brkPt day)
                        currentEventBannerDates.push(`${endYear}-${endMonthNum}-${breakPTArr[i]}`)

                        //adding blank dates to blankDates array
                        if (Math.abs(spanNextRow[i + 1] - breakPTArr[i]) > 0) {
                            for (let j = breakPTArr[i] + 1; j <= spanNextRow[i + 1]; j++) {
                                currentEventBlankDivsDates.push(`${endYear}-${endMonthNum}-${j}`)
                            }
                        }
                    }

                    //last row
                    else {
                        //creating title div for monthview task
                        var tempDiv = document.createElement('div')
                        tempDiv.classList.add("task")
                        tempDiv.id = name
                        tempDiv.innerHTML = name
                        tempDiv.addEventListener('click', () => { generateDetailedView(events[searchEventTasks(events, eventKey)]) })
                        calcBannerWidth(tempDiv, Math.abs(endDay - breakPTArr[i]) + 1)//calculates banner width by total days spanned
                        currentEventBannerDivs.push(tempDiv)

                        //adding to banner dates array (here is last brkPt day)
                        currentEventBannerDates.push(`${endYear}-${endMonthNum}-${breakPTArr[i]}`)

                        //pushing blank dates into blankDates array
                        if (Math.abs(endDay - breakPTArr[i]) > 0) {
                            for (let j = breakPTArr[i] + 1; j <= endDay; j++) {
                                currentEventBlankDivsDates.push(`${endYear}-${endMonthNum}-${j}`)
                            }
                        }
                    }
                }//end assembling banners for
            }
        }//end MULTI-MONTH EVENTS (same year) case 1

        //CASE 2: span current month > nxt month; startMonth=currentMonth, endMonth=currentMonth+1
        else if (startMonthNum + 1 == endMonthNum && Math.abs(startMonthNum - endMonthNum) == 1 && monthDiff < 2 || endMonthNum == 1 && currentMonth == 11 && monthDiff < 2) {
            let numRows = 0
            let currentRow = getRowOfDate(startMonth, startDay, startYear)
            let breakPTArr = [] //array of break point days; stores day(s) of month where next row starts
            let breakInd = 0 //index 0 is the first breakpt to next row
            let spanNextRow = [] //array to hold last day of event spanning banner in 1 row; stores day(s) before row ends
            let spanInd = 0
            let totalDays = 0
            let singleRowCalc = false
            totalDays = getTotalDays(startYear, startMonthNum)
            numRows = totalDays / 7 - 1
            let daysInCurentMonth = new Date(parseInt(startYear), startMonthNum, 0).getDate() //# of days in specified month/year
            if (document.getElementById(`${endYear}-${endMonthNum}-1`) == null) {
                endDay = daysInCurentMonth
            } else {
                let firstDayIndEndMonth = new Date(`${endMonth} 1, ${endYear}`).getDay() //0 = sunday 6 = saturday
                //need to treat this as extension of prev-month days to get correct length
                let daysFromLastMonth = totalDays - daysInCurentMonth - Math.abs(7 - firstDayIndEndMonth)
                let endDayNum = parseInt(endDay) + daysInCurentMonth + daysFromLastMonth//this is the last day of the event in the last row extended as days of current month (for width calc)
                let savedEndDay = endDay
                //must consider that the end day may not be on the page
                if (endDayNum > totalDays) {
                    endDay = totalDays - daysFromLastMonth
                }
                else {
                    endDay = endDayNum - daysFromLastMonth
                }
            }//nxt month days in cur month or not

            //single row width calc; or multi-line
            if (currentRow == numRows) {
                breakInd++//run banner placement on only first row
                spanNextRow[spanInd] = parseInt(endDay)
                singleRowCalc = true
            } else {
                //find breakpoint day
                for (let i = parseInt(startDay) + 1; i <= parseInt(endDay); i++) {
                    let a = getRowOfDate(startMonth, i, startYear)
                    if (a != currentRow && a != -1) {
                        breakPTArr[breakInd] = i
                        spanNextRow[spanInd] = i - 1
                        spanInd++
                        breakInd++
                        currentRow++
                    }
                }//end for -breakpoints
            }
            //assembling banners & blanks & dates array
            //breakInd and SpanInd should always be equal
            for (let i = 0; i < breakInd; i++) {
                //0th row
                if (i == 0) {
                    //creating title div for monthview task
                    var tempDiv = document.createElement('div')
                    tempDiv.classList.add("task")
                    tempDiv.id = name
                    tempDiv.innerHTML = name
                    tempDiv.addEventListener('click', () => { generateDetailedView(events[searchEventTasks(events, eventKey)]) })
                    calcBannerWidth(tempDiv, Math.abs(startDay - spanNextRow[i]) + 1)//calculates banner width by total days spanned
                    currentEventBannerDivs.push(tempDiv)

                    //adding to banner dates array (here is just start day)
                    currentEventBannerDates.push(`${startYear}-${startMonthNum}-${startDay}`)

                    //adding blank dates to blankDates array
                    let tempCurMonth = startMonthNum
                    let tempCurYear = startYear
                    let k = parseInt(startDay) + 1
                    for (let j = 0; j < Math.abs(startDay - spanNextRow[i]); j++) {
                        if (k > daysInCurentMonth) {
                            tempCurMonth = endMonthNum
                            tempCurYear = endYear
                            k = 1
                        }
                        currentEventBlankDivsDates.push(`${tempCurYear}-${tempCurMonth}-${k}`)
                        k++
                    }
                    if (singleRowCalc) {
                        break
                    }
                }
                //ith row
                if (i + 1 < breakPTArr.length) {
                    //creating title div for monthview task
                    var tempDiv = document.createElement('div')
                    tempDiv.classList.add("task")
                    tempDiv.id = name
                    tempDiv.innerHTML = name
                    tempDiv.addEventListener('click', () => { generateDetailedView(events[searchEventTasks(events, eventKey)]) })
                    calcBannerWidth(tempDiv, Math.abs(spanNextRow[i + 1] - breakPTArr[i]) + 1)//calculates banner width by total days spanned
                    currentEventBannerDivs.push(tempDiv)

                    //adding to banner dates array (here is each brkPt day)
                    currentEventBannerDates.push(`${startYear}-${startMonthNum}-${breakPTArr[i]}`)

                    //adding blank dates to blankDates array
                    if (Math.abs(spanNextRow[i + 1] - breakPTArr[i]) > 0) {
                        for (let j = breakPTArr[i] + 1; j <= spanNextRow[i + 1]; j++) {
                            currentEventBlankDivsDates.push(`${startYear}-${startMonthNum}-${j}`)
                        }
                    }
                }

                //last row
                else {
                    //creating title div for monthview task
                    var tempDiv = document.createElement('div')
                    tempDiv.classList.add("task")
                    tempDiv.id = name
                    tempDiv.innerHTML = name
                    tempDiv.addEventListener('click', () => { generateDetailedView(events[searchEventTasks(events, eventKey)]) })
                    calcBannerWidth(tempDiv, Math.abs(endDay - breakPTArr[i]) + 1)//calculates banner width by total days spanned
                    currentEventBannerDivs.push(tempDiv)

                    //adding to banner dates array (here is last brkPt day)
                    currentEventBannerDates.push(`${startYear}-${startMonthNum}-${breakPTArr[i]}`)

                    //pushing blank dates into blankDates array
                    let tempCurMonth = startMonthNum
                    let tempCurYear = startYear
                    let k = breakPTArr[i] + 1
                    if (Math.abs(endDay - breakPTArr[i]) > 0) {
                        for (let j = 0; j < Math.abs(endDay - breakPTArr[i]); j++) {
                            if (k > daysInCurentMonth) {
                                tempCurMonth = endMonthNum
                                tempCurYear = endYear
                                k = 1
                            }
                            currentEventBlankDivsDates.push(`${tempCurYear}-${tempCurMonth}-${k}`)
                            k++
                        }
                    }
                }
            }//end assembling banners for
        }//end MULTI-MONTH EVENTS in same year case 2

        //CASE 3: MORE THAN 2 months SPAN
        //Any events that span more than just an adjacent month to the current month should be processed here
        //would like for it to also be able to process multi-month events that span over multiple years
        else if (monthDiff >= 2) {
            //event is at starting month of multi-month event: edited CASE 2
            if (currentDateMonthOBJ === startDateMonthOBJ) {
                let singleRowCalc = false
                let numRows = 0
                let currentRow = getRowOfDate(startMonth, startDay, startYear)
                let breakPTArr = [] //array of break point days; stores day(s) of month where next row starts
                let breakInd = 0 //index 0 is the first breakpt to next row
                let spanNextRow = [] //array to hold last day of event spanning banner in 1 row; stores day(s) before row ends
                let spanInd = 0
                let totalDays = 0
                totalDays = getTotalDays(startYear, startMonthNum)
                numRows = totalDays / 7 - 1
                let daysInCurentMonth = new Date(parseInt(startYear), startMonthNum, 0).getDate() //# of days in specified month/year
                let firstDayIndEndMonth = 0//first day index of nxt month on current month pg
                //edge case december
                if (currentMonth == 11) {
                    firstDayIndEndMonth = new Date(`January 1, ${currentYear + 1}`).getDay() //0 = sunday 6 = saturday
                }
                else { //normal case
                    firstDayIndEndMonth = new Date(`${currentMonth + 2} 1, ${currentYear}`).getDay() //0 = sunday 6 = saturday
                }

                //need to treat this as extension of prev-month days to get correct length
                let daysFromLastMonth = totalDays - daysInCurentMonth - Math.abs(7 - firstDayIndEndMonth)
                // OLD let endDayNum = parseInt(endDay) + daysInCurentMonth + daysFromLastMonth//this is the last day of the event in the last row extended as days of current month (for width calc)
                let endDayNum = daysInCurentMonth + Math.abs(7 - firstDayIndEndMonth)
                //we know the end day will always be the last day on the page in CASE 3 FIRST MONTH
                let savedEndDay = endDay //not sure if needed
                //calculates last day on page; edge case december with no january days
                if (currentMonth == 11 && document.getElementById(`${currentYear + 1}-1-1`) == null) {
                    endDay = daysInCurentMonth
                }//normal case, and prevented from running in december, that's what first case is for
                else if (document.getElementById(`${startYear}-${startMonthNum + 1}-1`) == null && currentMonth != 11) {
                    endDay = daysInCurentMonth
                } else {
                    endDay = endDayNum
                }


                let a = new Date(`${startMonthNum}-${startDay}-${startYear}`)//start date OBJ
                let a1 = 0//end date OBJ
                //endDate is in same month and year
                if (firstDayIndEndMonth == 0) {
                    a1 = new Date(`${startYear}-${startMonthNum}-${endDay}`)
                }
                else if (firstDayIndEndMonth != 0 && currentMonth == 11) {
                    a1 = new Date(`${currentYear + 1}-1-${endDay - daysInCurentMonth}`)
                }
                //non year boudary endDate ends in next month, index startMonthNum forward 1 
                else {
                    a1 = new Date(`${startYear}-${startMonthNum + 1}-${endDay - daysInCurentMonth}`)
                }

                let daysBtw = Math.abs((a1.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
                //single row width calculation if event starts in last row of current month
                if (daysBtw <= 6) {
                    singleRowCalc = true
                    breakInd++
                    spanNextRow.push(parseInt(endDay))
                }
                else {
                    //find breakpoint days
                    let tempCurMonth = startMonthNum
                    let tempCurYear = startYear
                    let k = parseInt(startDay) + 1
                    for (let i = 0; i < Math.abs(parseInt(startDay) - parseInt(endDay)); i++) {
                        daysInCurentMonth = new Date(parseInt(tempCurYear), tempCurMonth, 0).getDate()
                        if (k > daysInCurentMonth) {
                            if (tempCurMonth == 12) {
                                tempCurMonth = 1
                                tempCurYear++
                            } else {
                                tempCurMonth++
                            }
                            k = 1
                        }
                        let a = getRowOfDate(startMonth, k, startYear)
                        if (a != currentRow && a != -1 && tempCurMonth == startMonthNum) {
                            breakPTArr[breakInd] = k
                            spanNextRow[spanInd] = k - 1
                            spanInd++
                            breakInd++
                            currentRow++
                        }
                        k++
                    }//end for -breakpoints
                }

                //assembling banners & blanks & dates array
                //breakInd and SpanInd should always be equal
                for (let i = 0; i < breakInd; i++) {
                    //0th row
                    if (i == 0) {
                        //creating title div for monthview task
                        var tempDiv = document.createElement('div')
                        tempDiv.classList.add("task")
                        tempDiv.id = name
                        tempDiv.innerHTML = name
                        tempDiv.addEventListener('click', () => { generateDetailedView(events[searchEventTasks(events, eventKey)]) })
                        calcBannerWidth(tempDiv, Math.abs(startDay - spanNextRow[i]) + 1)//calculates banner width by total days spanned
                        currentEventBannerDivs.push(tempDiv)

                        //adding to banner dates array (here is just start day)
                        currentEventBannerDates.push(`${startYear}-${startMonthNum}-${startDay}`)

                        //adding blank dates to blankDates array
                        let tempCurMonth = startMonthNum
                        let tempCurYear = startYear
                        let k = parseInt(startDay) + 1
                        for (let j = 0; j < Math.abs(startDay - spanNextRow[i]); j++) {
                            if (k > daysInCurentMonth) {
                                if (tempCurMonth == 12) {
                                    tempCurMonth = 1
                                    tempCurYear++
                                } else {
                                    tempCurMonth++
                                }
                                k = 1
                            }
                            currentEventBlankDivsDates.push(`${tempCurYear}-${tempCurMonth}-${k}`)
                            k++
                        }
                        if (singleRowCalc) {
                            break
                        }
                    }
                    //ith row
                    if (i + 1 < breakPTArr.length) {
                        //creating title div for monthview task
                        var tempDiv = document.createElement('div')
                        tempDiv.classList.add("task")
                        tempDiv.id = name
                        tempDiv.innerHTML = name
                        tempDiv.addEventListener('click', () => { generateDetailedView(events[searchEventTasks(events, eventKey)]) })
                        calcBannerWidth(tempDiv, Math.abs(spanNextRow[i + 1] - breakPTArr[i]) + 1)//calculates banner width by total days spanned
                        currentEventBannerDivs.push(tempDiv)

                        //adding to banner dates array (here is each brkPt day)
                        currentEventBannerDates.push(`${startYear}-${startMonthNum}-${breakPTArr[i]}`)

                        //adding blank dates to blankDates array
                        if (Math.abs(spanNextRow[i + 1] - breakPTArr[i]) > 0) {
                            for (let j = breakPTArr[i] + 1; j <= spanNextRow[i + 1]; j++) {
                                currentEventBlankDivsDates.push(`${startYear}-${startMonthNum}-${j}`)
                            }
                        }
                    }
                    //last row
                    else {
                        //creating title div for monthview task
                        var tempDiv = document.createElement('div')
                        tempDiv.classList.add("task")
                        tempDiv.id = name
                        tempDiv.innerHTML = name
                        tempDiv.addEventListener('click', () => { generateDetailedView(events[searchEventTasks(events, eventKey)]) })
                        calcBannerWidth(tempDiv, Math.abs(endDay - breakPTArr[i]) + 1)//calculates banner width by total days spanned
                        currentEventBannerDivs.push(tempDiv)

                        //adding to banner dates array (here is last brkPt day)
                        currentEventBannerDates.push(`${startYear}-${startMonthNum}-${breakPTArr[i]}`)

                        //pushing blank dates into blankDates array
                        let tempCurMonth = startMonthNum
                        let tempCurYear = startYear
                        let k = breakPTArr[i] + 1
                        if (Math.abs(endDay - breakPTArr[i]) > 0) {
                            for (let j = 0; j < Math.abs(endDay - breakPTArr[i]); j++) {
                                daysInCurentMonth = new Date(parseInt(tempCurYear), tempCurMonth, 0).getDate()
                                if (k > daysInCurentMonth) {
                                    if (tempCurMonth == 12) {
                                        tempCurMonth = 1
                                        tempCurYear++
                                    } else {
                                        tempCurMonth++
                                    }
                                    k = 1
                                }
                                currentEventBlankDivsDates.push(`${tempCurYear}-${tempCurMonth}-${k}`)
                                k++
                            }
                        }
                    }
                }//end assembling banners for
            }//end if: EVENT AT BEGINING MONTH
            //event is in middle month of multi-month event
            else if (currentDateMonthOBJ > startDateMonthOBJ && currentDateMonthOBJ < endDateMonthOBJ) {
                //Event can either end on this monthView (in nxt month days), or end on next monthView
                //Event ends on current monthview pg in nxt Month days; edited CASE 2
                //these vars month and year are used throughout this else if case to keep track of correct month and year
                let tempCurMonth = currentMonth + 1 //month number (int)
                let tempCurYear = currentYear //year (int)

                let numRows = 0
                let currentRow = 0 //always spaning into middle, or end month at first row
                let breakPTArr = [] //array of break point days; stores day(s) of month where next row starts
                let breakInd = 0 //index 0 is the first breakpt to next row
                let spanNextRow = [] //array to hold last day of event spanning banner in 1 row; stores day(s) before row ends
                let spanInd = 0
                let totalDays = 0
                totalDays = getTotalDays(currentYear, currentMonth + 1)
                numRows = totalDays / 7 - 1
                let daysInCurentMonth = new Date(parseInt(currentYear), currentMonth + 1, 0).getDate() //# of days in specified month/year
                let daysInLastMonth = new Date(parseInt(currentYear), currentMonth, 0).getDate()
                let firstDayIndEndMonth = 0 //0 = sunday 6 = saturday
                //edge case december
                if (currentMonth == 11) {
                    firstDayIndEndMonth = new Date(`January 1, ${currentYear + 1}`).getDay()
                } else { //normal calculation
                    firstDayIndEndMonth = new Date(`${currentMonth + 2} 1, ${currentYear}`).getDay()
                }
                let firstDayIndCurMonth = new Date(`${currentMonth + 1} 1, ${currentYear}`).getDay() //0 = sunday 6 = saturday
                //let daysFromLastMonth = totalDays - daysInCurentMonth - Math.abs(7 - firstDayIndEndMonth)
                // OLD let endDayNum = 7 - firstDayIndEndMonth + daysInCurentMonth + daysFromLastMonth//this is the last day of the event in the last row extended as days of current month (for width calc)
                let endDayNum = daysInCurentMonth + Math.abs(7 - firstDayIndEndMonth)//this is the last day of the event in the last row extended as days of current month (for width calc)
                let savedEndDay = endDay
                let firstDayLastMonth = daysInLastMonth - firstDayIndCurMonth + 1 //calculates first day from last month in month view
                //if end date is on page; don't go through other else if's to change end date
                if (document.getElementById(`${endYear}-${endMonthNum}-${endDay}`) != null) {
                    //extend endDay as days of currentMonth same by not going to other cases
                    endDay = parseInt(endDay) + daysInCurentMonth
                }
                //calculates last day on page; edge case december
                else if (currentMonth == 11 && document.getElementById(`${currentYear + 1}-1-1`) == null) {
                    endDay = daysInCurentMonth
                }//normal case; first of nxt month, and not in decemeber, that's what first case is for
                else if (document.getElementById(`${currentYear}-${currentMonth + 2}-1`) == null && currentMonth != 11) {
                    endDay = daysInCurentMonth
                } else {//extend current month days
                    endDay = endDayNum
                }


                //calculate startday: start is either first of month, or first day from last month
                if (firstDayIndCurMonth === 0) {
                    startDay = 1
                }
                //starting in previous month on currentMonth page
                else {
                    startDay = firstDayLastMonth
                    //edge case multi-month event spanning into next year
                    if (currentMonth == 0) {
                        tempCurYear = currentYear - 1
                        tempCurMonth = 12
                    }
                    else {
                        tempCurMonth = currentMonth
                    }
                }

                //find breakpoint days
                let k = parseInt(startDay) + 1
                //have to use Date obj here to account for many scenarios
                let daysBtw = 0  //Math.abs((a1.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
                let a = 0
                let a1 = 0

                //january edge case: years will be one apart
                if (currentMonth == 0) {
                    a = new Date(`${tempCurYear}-${tempCurMonth}-${startDay}`)
                    //if january 31 is last day of month, get endDay + month of january
                    if (firstDayIndEndMonth == 0) {
                        a1 = new Date(`${tempCurYear + 1}-1-${endDay}`)
                    }
                    else { //if not january 31 is last day of month, get endDay + month of Feb
                        a1 = new Date(`${tempCurYear + 1}-2-${endDay - daysInCurentMonth}`)
                    }
                    daysBtw = Math.abs((a1.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
                }
                else {
                    a = new Date(`${tempCurYear}-${tempCurMonth}-${startDay}`)
                    //we have extended endDay in current month, but it really belongs to nxt month
                    if (endDay > daysInCurentMonth) {
                        //december edge case
                        if (currentMonth == 11) {
                            a1 = new Date(`${tempCurYear}-1-${endDay - daysInCurentMonth}`)
                        }
                        else {
                            a1 = new Date(`${tempCurYear}-${currentMonth + 2}-${endDay - daysInCurentMonth}`)
                        }
                    }
                    //event ends in current month
                    else {
                        a1 = new Date(`${tempCurYear}-${currentMonth + 1}-${endDay}`)
                    }

                    daysBtw = Math.abs((a1.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
                }

                //find breakpoint days
                for (let i = 0; i < daysBtw; i++) {
                    daysInCurentMonth = new Date(parseInt(tempCurYear), tempCurMonth, 0).getDate()
                    if (k > daysInCurentMonth) {
                        if (tempCurMonth == 12) {
                            tempCurMonth = 1
                            tempCurYear++
                        } else {
                            tempCurMonth++
                        }
                        k = 1
                    }
                    let a = getRowOfDate(months[tempCurMonth - 1], k, tempCurYear)
                    if (a != currentRow && a != -1 && tempCurMonth == currentMonth + 1) {
                        breakPTArr[breakInd] = k
                        spanNextRow[spanInd] = k - 1
                        spanInd++
                        breakInd++
                        currentRow++
                    }
                    k++
                }//end for -breakpoints

                //assembling banners, blanks, & dates array
                //breakInd and SpanInd should always be equal
                for (let i = 0; i < breakInd; i++) {
                    //0th row
                    if (i == 0) {
                        tempCurMonth = currentMonth + 1 //test fix for edge case december -> january
                        //first of month is first day of grid, start in cur month and year; else start in prev month
                        if (firstDayIndCurMonth == 0) {
                            tempCurMonth = currentMonth + 1
                            tempCurYear = currentYear
                        }
                        else {
                            //edge case december -> january
                            if (tempCurMonth == 1) {
                                tempCurMonth = 12
                                tempCurYear = currentYear - 1
                            }
                            //every other month boudary: starting in prev-month on current month page
                            else {
                                tempCurMonth = currentMonth //0 indexed, so technically last month
                                tempCurYear = currentYear
                            }
                        }
                        //for day width calculation: covers edge case spanning into nxt month
                        let sD = new Date(`${tempCurYear}-${tempCurMonth}-${startDay}`)//start Date as OBJ
                        let eD = new Date(`${currentYear}-${currentMonth + 1}-${spanNextRow[i]}`)//end Date as OBJ
                        daysBtw = Math.floor(Math.abs((eD.getTime() - sD.getTime()) / (1000 * 60 * 60 * 24)))

                        //creating title div for monthview task
                        var tempDiv = document.createElement('div')
                        tempDiv.classList.add("task")
                        tempDiv.id = name
                        tempDiv.innerHTML = name
                        tempDiv.addEventListener('click', () => { generateDetailedView(events[searchEventTasks(events, eventKey)]) })
                        calcBannerWidth(tempDiv, daysBtw + 1)//calculates banner width by total days spanned
                        currentEventBannerDivs.push(tempDiv)

                        //adding to banner dates array (here is just start day)
                        currentEventBannerDates.push(`${tempCurYear}-${tempCurMonth}-${startDay}`)

                        //adding blank dates to blankDates array

                        let k = parseInt(startDay) + 1
                        for (let j = 0; j < daysBtw; j++) {
                            daysInCurentMonth = new Date(parseInt(tempCurYear), tempCurMonth, 0).getDate()
                            if (k > daysInCurentMonth) {
                                if (tempCurMonth == 12) {
                                    tempCurMonth = 1
                                    tempCurYear++
                                } else {
                                    tempCurMonth++
                                }
                                k = 1
                            }
                            currentEventBlankDivsDates.push(`${tempCurYear}-${tempCurMonth}-${k}`)
                            k++
                        }
                    }
                    //ith row
                    if (i + 1 < breakPTArr.length) {
                        //creating title div for monthview task
                        var tempDiv = document.createElement('div')
                        tempDiv.classList.add("task")
                        tempDiv.id = name
                        tempDiv.innerHTML = name
                        tempDiv.addEventListener('click', () => { generateDetailedView(events[searchEventTasks(events, eventKey)]) })
                        calcBannerWidth(tempDiv, Math.abs(spanNextRow[i + 1] - breakPTArr[i]) + 1)//calculates banner width by total days spanned
                        currentEventBannerDivs.push(tempDiv)


                        //adding to banner dates array (here is each brkPt day)
                        currentEventBannerDates.push(`${tempCurYear}-${tempCurMonth}-${breakPTArr[i]}`)

                        //adding blank dates to blankDates array
                        if (Math.abs(spanNextRow[i + 1] - breakPTArr[i]) > 0) {
                            for (let j = breakPTArr[i] + 1; j <= spanNextRow[i + 1]; j++) {
                                currentEventBlankDivsDates.push(`${tempCurYear}-${tempCurMonth}-${j}`)
                            }
                        }
                    }

                    //last row
                    else {
                        //creating title div for monthview task
                        var tempDiv = document.createElement('div')
                        tempDiv.classList.add("task")
                        tempDiv.id = name
                        tempDiv.innerHTML = name
                        tempDiv.addEventListener('click', () => { generateDetailedView(events[searchEventTasks(events, eventKey)]) })
                        calcBannerWidth(tempDiv, Math.abs(endDay - breakPTArr[i]) + 1)//calculates banner width by total days spanned
                        currentEventBannerDivs.push(tempDiv)

                        //adding to banner dates array (here is last brkPt day)
                        currentEventBannerDates.push(`${tempCurYear}-${tempCurMonth}-${breakPTArr[i]}`)

                        //pushing blank dates into blankDates array
                        tempCurMonth = currentMonth + 1
                        tempCurYear = currentYear
                        let k = breakPTArr[i] + 1
                        if (Math.abs(endDay - breakPTArr[i]) > 0) {
                            for (let j = 0; j < Math.abs(endDay - breakPTArr[i]); j++) {
                                daysInCurentMonth = new Date(parseInt(tempCurYear), tempCurMonth, 0).getDate()
                                if (k > daysInCurentMonth) {
                                    if (tempCurMonth == 12) {
                                        tempCurMonth = 1
                                        tempCurYear++
                                    } else {
                                        tempCurMonth++
                                    }
                                    k = 1
                                }
                                currentEventBlankDivsDates.push(`${tempCurYear}-${tempCurMonth}-${k}`)
                                k++
                            }
                        }
                    }
                }//end assembling banners for
            }//end else if inside CASE 3 MIDDLE MONTH
            //event is in endMonth of multi-month event
            //CONDITION: currentMonth + 1 === endMonthNum && currentYear === parseInt(endYear)
            else {
                //Event must end on this page
                //these vars month and year are used throughout this else if case to keep track of correct month and year
                let tempCurMonth = currentMonth + 1 //month number (int)
                let tempCurYear = currentYear //year (int)

                let numRows = 0
                let currentRow = 0 //always spaning into middle, or end month at first row
                let breakPTArr = [] //array of break point days; stores day(s) of month where next row starts
                let breakInd = 0 //index 0 is the first breakpt to next row
                let spanNextRow = [] //array to hold last day of event spanning banner in 1 row; stores day(s) before row ends
                let spanInd = 0
                let totalDays = 0
                totalDays = getTotalDays(currentYear, currentMonth + 1)
                numRows = totalDays / 7 - 1
                let daysInCurentMonth = new Date(parseInt(currentYear), currentMonth + 1, 0).getDate() //# of days in specified month/year
                let daysInLastMonth = new Date(parseInt(currentYear), currentMonth, 0).getDate()
                let firstDayIndEndMonth = 0 //0 = sunday 6 = saturday
                if (currentMonth == 11) { //edge case decemeber
                    firstDayIndEndMonth = new Date(`January 1, ${currentYear + 1}`).getDay()
                } else { //normal calculation
                    firstDayIndEndMonth = new Date(`${currentMonth + 2} 1, ${currentYear}`).getDay()
                }
                let firstDayIndCurMonth = new Date(`${currentMonth + 1} 1, ${currentYear}`).getDay() //0 = sunday 6 = saturday
                //let daysFromLastMonth = totalDays - daysInCurentMonth - Math.abs(7 - firstDayIndEndMonth)
                // NOT USEDlet endDayNum = 7 - firstDayIndEndMonth + daysInCurentMonth + daysFromLastMonth//this is the last day of the event in the last row extended as days of current month (for width calc)
                let firstDayLastMonth = daysInLastMonth - firstDayIndCurMonth + 1 //calculates first day from last month in month view
                //endDay will be on page bc we are in the last month

                //calculate startday: start is either first of month, or first day from last month
                if (firstDayIndCurMonth === 0) {
                    startDay = 1
                }
                //starting in previous month on currentMonth page
                else {
                    startDay = firstDayLastMonth
                    //edge case multi-month event spanning into next year
                    if (currentMonth == 0) {
                        tempCurYear = currentYear - 1
                        tempCurMonth = 12
                    }
                    else {
                        tempCurMonth = currentMonth
                    }
                }


                let k = parseInt(startDay) + 1
                //have to use Date obj here to account for many scenarios
                let daysBtw = 0   //Math.abs((a1.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
                let a = 0 //start date
                let a1 = 0  //end date
                //start and end date are in same month
                if (firstDayIndCurMonth === 0) {
                    a = new Date(`${tempCurYear}-${tempCurMonth}-${startDay}`)
                    a1 = new Date(`${tempCurYear}-${tempCurMonth}-${endDay}`)
                }
                //or ending in january as curMonth and spanning dec -> jan
                else if (currentMonth == 0 && endMonthNum == 1) {
                    a = new Date(`${tempCurYear}-${tempCurMonth}-${startDay}`)
                    a1 = new Date(`${currentYear}-1-${endDay}`)
                }
                //or ending in january as curMonth and spanning only into previous month (dec) days
                else if (currentMonth == 0 && endMonthNum == 12 && document.getElementById(`${currentYear - 1}-12-31`) != null) {
                    a = new Date(`${tempCurYear}-${tempCurMonth}-${startDay}`)
                    a1 = new Date(`${tempCurYear}-${tempCurMonth}-${endDay}`)
                }
                //else ending in non year boudary month and can use index of months
                else {
                    a = new Date(`${tempCurYear}-${tempCurMonth}-${startDay}`)
                    a1 = new Date(`${tempCurYear}-${tempCurMonth + 1}-${endDay}`)
                }
                daysBtw = Math.abs((a1.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))

                //single row width calc; or multi-line
                let singleRowCalc = false
                if (daysBtw <= 6) {
                    breakInd++//run banner placement on only first row
                    spanNextRow.push(parseInt(endDay))
                    singleRowCalc = true
                }
                else {
                    //find breakpoint days for each row
                    for (let i = 0; i < daysBtw; i++) {
                        daysInCurentMonth = new Date(parseInt(currentYear), tempCurMonth, 0).getDate()
                        if (k > daysInCurentMonth) {
                            if (tempCurMonth == 12) {
                                tempCurMonth = 1
                                tempCurYear++
                            } else {
                                tempCurMonth++
                            }
                            k = 1
                        }
                        let a = getRowOfDate(months[tempCurMonth - 1], k, currentYear)
                        if (a != currentRow && a != -1 && currentMonth + 1 == tempCurMonth) {

                            breakPTArr[breakInd] = k
                            spanNextRow[spanInd] = k - 1
                            spanInd++
                            breakInd++
                            currentRow++
                        }
                        k++
                    }//end for -breakpoints
                }
                //assembling banners, blanks, & dates array
                //breakInd and SpanInd should always be equal
                for (let i = 0; i < breakInd; i++) {
                    //0th row
                    if (i == 0) {
                        tempCurMonth = currentMonth + 1 //test fix for edge case december -> january
                        //first of month is first day of grid, start in cur month; else start in prev month
                        if (firstDayIndCurMonth == 0) {
                            tempCurMonth = currentMonth + 1
                            tempCurYear = currentYear
                        }
                        else {
                            //edge case december -> january
                            if (tempCurMonth == 1) {
                                tempCurMonth = 12
                                tempCurYear = currentYear - 1
                            }
                            //every other month boudary: starting in prev-month on current month page
                            else {
                                tempCurMonth = currentMonth //0 indexed, so technically last month
                                tempCurYear = currentYear
                            }
                        }
                        //for day width calculation: covers edge case spanning into nxt month
                        let sD = new Date(`${tempCurYear}-${tempCurMonth}-${startDay}`)//start Date as OBJ
                        let eD = 0//end Date as OBJ
                        //if we are spanning btw months, index tempCurMonth to curMonth
                        if (tempCurMonth != currentMonth + 1 && currentMonth == 0) {
                            //indexing from december to jan, multi-row banner
                            eD = new Date(`${currentYear}-1-${spanNextRow[i]}`)
                        }
                        else if (tempCurMonth != currentMonth + 1) {//normal case
                            eD = new Date(`${currentYear}-${tempCurMonth + 1}-${spanNextRow[i]}`)
                        } else {
                            eD = new Date(`${currentYear}-${tempCurMonth}-${spanNextRow[i]}`)
                        }
                        daysBtw = Math.floor(Math.abs((eD.getTime() - sD.getTime()) / (1000 * 60 * 60 * 24)))
                        //creating title div for monthview task
                        var tempDiv = document.createElement('div')
                        tempDiv.classList.add("task")
                        tempDiv.id = name
                        tempDiv.innerHTML = name
                        tempDiv.addEventListener('click', () => { generateDetailedView(events[searchEventTasks(events, eventKey)]) })
                        calcBannerWidth(tempDiv, daysBtw + 1)//calculates banner width by total days spanned
                        currentEventBannerDivs.push(tempDiv)
                        //push 0th row event banner
                        currentEventBannerDates.push(`${tempCurYear}-${tempCurMonth}-${startDay}`)

                        //adding blank dates to blankDates array
                        let k = parseInt(startDay) + 1
                        for (let j = 0; j < daysBtw; j++) {
                            daysInCurentMonth = new Date(parseInt(currentYear), tempCurMonth, 0).getDate()
                            if (k > daysInCurentMonth) {
                                if (tempCurMonth == 12) {
                                    tempCurMonth = 1
                                    tempCurYear++
                                } else {
                                    tempCurMonth++
                                }
                                k = 1
                            }
                            currentEventBlankDivsDates.push(`${tempCurYear}-${tempCurMonth}-${k}`)
                            k++
                        }
                        //single row banner placement
                        if (singleRowCalc) {
                            break
                        }
                    }//end 0th row placment
                    //ith row
                    if (i + 1 < breakPTArr.length) {
                        var width = Math.abs(spanNextRow[i + 1] - breakPTArr[i]) * 7 + 7 //7vw is equal to about 200px on 1920px wide monitor; which is one grid box; +7 bc we want total days, not difference
                        //creating title div for monthview task
                        var tempDiv = document.createElement('div')
                        tempDiv.classList.add("task")
                        tempDiv.id = name
                        tempDiv.innerHTML = name
                        tempDiv.addEventListener('click', () => { generateDetailedView(events[searchEventTasks(events, eventKey)]) })
                        calcBannerWidth(tempDiv, Math.abs(spanNextRow[i + 1] - breakPTArr[i]) + 1)//calculates banner width by total days spanned
                        currentEventBannerDivs.push(tempDiv)

                        //adding to banner dates array (here is each brkPt day)
                        currentEventBannerDates.push(`${tempCurYear}-${tempCurMonth}-${breakPTArr[i]}`)

                        //adding blank dates to blankDates array
                        if (Math.abs(spanNextRow[i + 1] - breakPTArr[i]) > 0) {
                            for (let j = breakPTArr[i] + 1; j <= spanNextRow[i + 1]; j++) {
                                currentEventBlankDivsDates.push(`${tempCurYear}-${tempCurMonth}-${j}`)
                            }
                        }
                    }

                    //last row
                    else {
                        //creating title div for monthview task
                        var tempDiv = document.createElement('div')
                        tempDiv.classList.add("task")
                        tempDiv.id = name
                        tempDiv.innerHTML = name
                        tempDiv.addEventListener('click', () => { generateDetailedView(events[searchEventTasks(events, eventKey)]) })
                        calcBannerWidth(tempDiv, Math.abs(endDay - breakPTArr[i]) + 1)//calculates banner width by total days spanned
                        currentEventBannerDivs.push(tempDiv)

                        //adding to banner dates array (here is last brkPt day)
                        currentEventBannerDates.push(`${tempCurYear}-${tempCurMonth}-${breakPTArr[i]}`)

                        //pushing blank dates into blankDates array
                        tempCurMonth = currentMonth + 1
                        tempCurYear = currentYear
                        let k = breakPTArr[i] + 1
                        if (Math.abs(endDay - breakPTArr[i]) > 0) {
                            for (let j = 0; j < Math.abs(endDay - breakPTArr[i]); j++) {
                                if (k > daysInCurentMonth) {
                                    if (tempCurMonth == 12) {
                                        tempCurMonth = 1
                                        tempCurYear++
                                    } else {
                                        tempCurMonth++
                                    }
                                    k = 1
                                }
                                currentEventBlankDivsDates.push(`${tempCurYear}-${tempCurMonth}-${k}`)
                                k++
                            }
                        }
                    }
                }//end assembling banners for
            }
        }//end CASE 3 multi-month >= 2



        //NEW BANNER PLACEMENT CODE
        //place banners
        let currentEventAdded = false //bool that indicates if the current event banner was added, if so we will add it's corresponding blanks
        const numEventsPerDay = 2 //########----IMPORTANT----############## this variable controls the number of tasks allowed per day 
        for (let i = 0; i < currentEventBannerDivs.length; i++) {
            currentEventAdded = false
            let taskChildren = null //All Events under current date
            let blankChildren = null //All blanks under current event date\
            let extraTask = null
            let parent = document.getElementById(currentEventBannerDates[i])//ARR NEEDED should hold the date in format mm-dd-yyyy, to refrence where the event banner should be placed for each line



            //preventing null refrence errors when looking at children of parent
            if (parent == null) {
                console.log("error: func PLACE EVENTs: Could not find day of month grid box")
                continue
            }
            //grabs all children under current day grid so we can look at what tasks are under it
            else {
                taskChildren = parent.querySelectorAll(".task")
                blankChildren = parent.querySelectorAll(".monthview-blank")
                extraTask = parent.querySelector("#extra_Tasks")

                //edge Case B, append element as first Event (under div day num)
                let classList = parent.classList //search this for caseb
                let casebPrevEvent = false //denotes if a day on the page is already marked as caseB should follow case b placement procedure, but not COMPUTATION
                let casebEvent = false //day is not currently marked as case b, but could potentially be a case b
                let casebToken = "" //token of class list containing # of events that can be placed under caseb protocol
                for (let j = 0; j < classList.length; j++) {
                    if (classList[j].includes('caseb')) {
                        casebToken = classList[j]
                        casebPrevEvent = true
                    }
                }

                //either current day has nothing, a combination of events and blanks < 2, or is full
                //if true, day has new event slot available
                if (taskChildren.length + blankChildren.length < numEventsPerDay) {
                    //EDGE CASE B
                    //previous event banner started earlier in week and spans through at least current date && !caseb event, bc we don't want to recheck case b days
                    //find correct startDate of banner
                    let startDate = "" //holds date in format yyyy-mm-dd
                    if (taskChildren.length === 0 && blankChildren.length > 0 && !casebPrevEvent) {
                        let year = parseDayBoxIdDate(currentEventBannerDates[i], true, false, false)
                        let month = parseDayBoxIdDate(currentEventBannerDates[i], false, true, false)
                        let day = parseDayBoxIdDate(currentEventBannerDates[i], false, false, true) //month boudary check needed here
                        let curDayWeekInd = new Date(currentEventBannerDates[i]).getDay()//we know our previous banner must start before this index as at this day, taskChildren.length === 0
                        let daysInCurentMonth = new Date(year, month, 0).getDate()
                        for (let j = 0; j <= curDayWeekInd; j++) {
                            let tempDay = day - j
                            //if tempDay goes negative or zero, we have crossed into the previous month
                            if (tempDay <= 0 && month === 1) { //edge case year boundary
                                tempDay = new Date(year, 12, 0).getDate() //last day of decemeber
                                year-- //index year down
                            }
                            else if (tempDay <= 0) { //normal case
                                tempDay = new Date(year, month - 1, 0).getDate() //last day of last month
                                month--
                            }
                            //if current on page is shorter than banner we are trying to place, then CASE B is in effect
                            if (document.getElementById(`${year}-${month}-${tempDay}`).getElementsByClassName('task') > 0) {
                                taskChildren = document.getElementById(startDate).querySelectorAll(".task") //change taskChildren to date where event banner exists
                                //if the banner spans at least onto our currentEventBanner start day, then it's case 2
                                if (taskChildren[taskChildren.length - 1].classList[1] <= curDayWeekInd+1) {
                                    //this is the startDate of shorter banner currently on page
                                    startDate = `${year}-${month}-${tempDay}`
                                    casebEvent = true // this is a current caseb event
                                    break
                                }//end if
                            }//end outer if
                        }//end for
                    }//end if taskChildren.length === 0 && blankChildren.length > 0 && !casebEvent

                    //event banner starts on same day as event we are currently trying to place (startDate can simply be currentEventBannerDates[i])
                    else if (taskChildren.length !== 0 && !casebPrevEvent) {
                        startDate = currentEventBannerDates[i]
                        casebEvent = true // this is a current caseb event
                    }

                    //CASE B COMPUTATION
                    //compare lengths of banner that currently exists on page, and new banner we're trying to place
                    //if current on page is shorter than banner we are trying to place, then CASE B is in effect
                    if (casebEvent && !casebPrevEvent) {
                        let curDayWeekInd = new Date(currentEventBannerDates[i]).getDay()
                        //if event on page spans to at least current day we are placing event
                        if (taskChildren[taskChildren.length - 1].classList[1] <= curDayWeekInd+1) {
                            //determine end date of current banner, and that day's index within the current week
                            
                            let numShorterEvents = 0 //initialize
                            //on the day we have a shorter banner that spans to banner we are placing, we want to know how many tasks exist on that day to know how many tasks can be placed above
                            for (let j = 0; j < taskChildren.length; j++) {
                                if (taskChildren[j].classList[1] <= curDayWeekInd+1) {
                                    numShorterEvents++
                                }
                            }
                            //let curDayWeekInd = new Date(currentEventBannerDates[i]).getDay()//we know our previous banner also starts on this date

                            let year = parseDayBoxIdDate(startDate, true, false, false)
                            let month = parseDayBoxIdDate(startDate, false, true, false)
                            let day = parseDayBoxIdDate(startDate, false, false, true)//month boudary check needed here
                            let daysInCurentMonth = new Date(year, month, 0).getDate()
                            let numDays = parseInt(currentEventBannerDivs[i].classList[1]) //number of days banner to place spans, mark as case b
                            //For loop marks the days where we can place events above a task that spans long below (ie CASE B)
                            for (let j = 1; j < numDays; j++) {
                                day++
                                //month/year boundary check
                                if (day > daysInCurentMonth && month == 12) {//edge case december
                                    day = 1
                                    month = 1
                                    year++
                                }
                                else if (day > daysInCurentMonth) {//normal case
                                    day = 1
                                    month++
                                }
                                if (document.getElementById(`${year}-${month}-${day}`) !== null) {
                                    document.getElementById(`${year}-${month}-${day}`).classList.add(`caseb_${numShorterEvents}`)//mark case 2 days so that on insertion we know to insert before monthnum div
                                }
                            }
                        }//end if
                    }
                    //case b PLACEMENT procedure
                    if (casebPrevEvent) {
                        let id = `monthview-daynum-${parseDayBoxIdDate(currentEventBannerDates[i], false, false, true)}`
                        let dayNumDiv = document.getElementById(id)//month grid day number div
                        //placing currentEventBanner
                        if (dayNumDiv !== null) {//error check
                            dayNumDiv.insertAdjacentElement("afterend", currentEventBannerDivs[i]) //inserts banner below the day number in that day grid box
                            currentEventAdded = true //current event was added
                        }
                        else {
                            console.log("Error func placeEvents: CaseB event cannot find monthview num div")
                        }
                        //if this is an already existing caseb day and casebToken is not empty
                        if (casebPrevEvent && casebToken) {
                            //index-- the # of events that fit in current day box
                            const regex = /^caseb_(\d)$/
                            let tokens = regex.exec(casebToken)
                            //check if current day had 1 slot left for a case b event to be placed
                            //if so remove that classlist marker
                            if (parseInt(tokens[1]) - 1 <= 0) {
                                parent.classList.remove(casebToken)
                            }
                            //else index the number of available caseb events on this day down 1 
                            else {
                                let newCasebToken = `${tokens[0]}${parseInt(tokens[1]) - 1}`
                                parent.classList.remove(casebToken)
                                parent.classList.add(newCasebToken)
                            }
                        }

                    }
                    //normal append banner as child
                    else {
                        parent.appendChild(currentEventBannerDivs[i])
                        currentEventAdded = true //current event was added
                    }

                }
                else if (taskChildren.length + blankChildren.length == numEventsPerDay && extraTask == null) {
                    let threeDots = document.createElement('div')
                    threeDots.id = "extra_Tasks"
                    threeDots.innerHTML = "..."
                    parent.appendChild(threeDots)//shows that a task was attempted to be added here, but was not for space preservation
                    break //if first event banner of current event is not placed, break from current event
                }
                else {
                    break //if first event banner of current event is not placed, break from current event
                }
            }//end else

            /* OLD extra TASKS "..." placement
            //add task to corresponding date grid when no tasks are present at that location; children length 1 accounts for day# as a child of grid box
            if (children.length == 1) {
                parent.appendChild(currentEventBannerDivs[i])
            }
 
            //add task to corresponding date grid when 1-2 tasks are present at that location
            else if (children.length > 1 && children.length < 4) {
                for (let i = 0; i < children.length; i++) {
                    //set boolearn false if task we are trying to insert exists under current date grid on page
                    if (children[i].id == name) {
                        addTask = false
                        break
                    }
                }//end for
 
                if (addTask) {
                    parent.appendChild(currentEventBannerDivs[i])
                }
            }//end else if
 
            //adds tasks as invisible elements after 3 tasks exist at that location
            else if (children.length >= 4) {
                for (let i = 0; i < children.length; i++) {
                    //set boolearn false if task we are trying to insert exists under current date grid on page
                    if (children[i].id == name) {
                        addTask = false
                        break
                    }
                }//end for
 
                if (addTask) {
                    parent.appendChild(currentEventBannerDivs[i])
                }
 
            }
            //three dots "..." control for insertion
            if (children.length > 4 && extraTaskBool == false) {
                parent.innerHTML += "<div id=\"extra_tasks\">...</div>"
            }
            //three dots "..." control for deletion and makes next in-line task visible
            else if (extraTaskBool == true && children.length <= 5) {
                for (let i = 0; i < children.length; i++) {
                    if (children[i].classList == "task inactive") {
                        children[i].classList.remove("inactive")
                        children[i].innerHTML = children[i].id
                        break
                    }
                }
 
                for (let i = 0; i < children.length; i++) {
                    if (children[i].id == "extra_tasks") {
                        children[i].remove()
                        break
                    }
                }
            }
            */
        }//end banner for
        if (currentEventAdded) {
            //blank placement
            for (let i = 0; i < currentEventBlankDivsDates.length; i++) {
                let blankParent = document.getElementById(currentEventBlankDivsDates[i])
                if (blankParent == null) {
                    console.log("error finding blank parent: func PLACE EVENTS")
                    break
                }
                let tempChildren = blankParent.getElementsByTagName("div")
                //prevents overpopulation of grid box (number of tasks per day + day number + "..." extra tasks)
                if (tempChildren.length >= numEventsPerDay + 2) {
                    break
                }
                //places blank
                let blank = document.createElement('div')
                blank.classList.add("monthview-blank")
                blankParent.appendChild(blank) //create styling in style sheet
            }//end for
        }//end if currentEventAdded

    }//end for events.length
}//end func placeEvents

//PARAMETERS: year: full year# (str); month: current month # (int 1 indexed)
//RETURN: total days of current month in current year
//function takes in date(all ints, month=int,not 0 indexed), and returns that months total days
function getTotalDays(year, month) {
    // "2024" "6"
    let totalDays = -1 //error with total days calc
    let numRows = 0
    if (month == 2) {
        numRows = getRowOfDate(months[month - 1], 28, year)
        if (numRows != -1) {
            totalDays = (numRows + 1) * 7 //gets the total number of days in a month grid
        }
    }
    else if (month == 2 && year % 4 == 0) {
        numRows = getRowOfDate(months[month - 1], 29, year) //leap year
        if (numRows != -1) {
            totalDays = (numRows + 1) * 7 //gets the total number of days in a month grid
        }
    }
    else if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
        numRows = getRowOfDate(months[month - 1], 31, year)
        if (numRows != -1) {
            totalDays = (numRows + 1) * 7 //gets the total number of days in a month grid
        }
    }
    else {
        numRows = getRowOfDate(months[month - 1], 30, year)
        if (numRows != -1) {
            totalDays = (numRows + 1) * 7 //gets the total number of days in a month grid
        }
    }

    return totalDays
}//end func getTotalDays

//PARAMETERS: events: currentMonthTasks Task class OBJ arr; name: name of current task (str)
//RETURN:
//given an event name, the function will search for it in currentMonthTasks and return the index of that task. returns -1 if not found
function searchEventTasks(events, key) {
    for (let i = 0; i < events.length; i++) {
        var tempKey = events[i].getKey()
        if (key === tempKey) {
            return i
        }
    }

    return -1
}//end func

//PARAMETERS: month: month in words eg. "May"; day: day# year: full year # endYear: default year, else full year # (str or int)
//RETURN: returns row index of curent date in it's respective month. (zero indexed)
//function takes in date in form month=strOfMonth, day=#, year=# 
//Does not work on nxt/prev month days that appear in current month 
function getRowOfDate(month, day, year, endYear = year) {
    //edge case for january year change
    if (year != endYear) {
        return 0
    }
    var monthNum = 0 //NOT 0 INDEXED
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    for (let i = 0; i < months.length; i++) {
        if (months[i] === month) {
            monthNum = i + 1 //NOT 0 INDEXED
            break
        }
    }
    let monthDays = new Date(year, monthNum, 0).getDate();
    let firstDayIndex = new Date(`${monthNum}-1-${year}`).getDay();
    let daysInLastMonth = new Date(year, monthNum - 1, 0).getDate();
    let totalDays = firstDayIndex + monthDays
    let rowCount = Math.ceil(totalDays / 7)
    let rowInd = 0
    const firstDayOfLastMonth = new Date(year, monthNum - 1, 1).getDay()
    const daysFromLastMonth = (firstDayOfLastMonth < 0) ? firstDayOfLastMonth + 7 : firstDayOfLastMonth;
    if (day <= monthDays) {
        for (let i = 0; i < rowCount * 7; i++) {
            if (i == parseInt(day) + daysFromLastMonth) {
                break;
            }
            if (i % 7 == 0 && i != 0) {
                rowInd++
            }
        }
    } else {
        rowInd = -1 //for return on invalid dates
    }

    //returns -1 if calculations are incorrect
    return rowInd
}//end func
//PARAMETERS: dateStr: start date; endDateStr: end date; format "May 9, 2024"
//RETURN: returns a merged string in format "STARTMONTH STARTDAY- ENDMONTH ENDDAY"
//dynamically generates detailedView date banner; takes paramters start and end date in format "May 9, 2024"
//returns a merged date string that show the span between months excluding the year
function mergeStart_EndDates(dateStr, endDateStr, sTime, eTime) {
    var startDay = parseDay(dateStr)
    var endDay = parseDay(endDateStr)
    var startMonth = parseMonth(dateStr)
    var endMonth = parseMonth(endDateStr)
    //var startYear = parseYear(dateStr)
    //var endYear = parseYear(endDateStr)
    var spanDateStr = ""

    //if the event has no associated times, or the event runs "ALL DAY", dont put time in date Banner
    if (sTime === "" && eTime === "" || sTime === "00:00:00" && eTime == "23:59:59") {
        //for multi day events we must check wether or not it spans multiple months
        if (startMonth != endMonth) {
            spanDateStr = startMonth + " " + startDay + " - " + endMonth + " " + endDay
        }

        //same month and day event
        else if (startMonth == startMonth && startDay == endDay) {
            spanDateStr = startMonth + " " + startDay
        }

        //same month different day event
        else {
            spanDateStr = startMonth + " " + startDay + " - " + endDay
        }
    }
    //Event Has time fields
    else {
        var sT = new Date(`Jan 1, 2020 ${sTime}`);
        var eT = new Date(`Jan 1, 2020 ${eTime}`);
        var finalStartTime = ""
        var finalEndTime = ""
        var timeArr = []
        timeArr.push(sT)
        timeArr.push(eT)
        for (let i = 0; i < timeArr.length; i++) {
            var hours = timeArr[i].getHours(); // gives the value in 24 hours format
            var AmOrPm = hours >= 12 ? 'pm' : 'am';
            hours = (hours % 12) || 12;
            var minutes = timeArr[i].getMinutes();
            //appends zero to front
            if (minutes === 0) {
                minutes = "00"
            }//appends zero to front
            else if (minutes < 10) {
                minutes = `0${minutes}`
            }
            //startTime
            if (i == 0) {
                finalStartTime = hours + ":" + minutes + AmOrPm;
            }
            //endTime
            if (i == 1) {
                finalEndTime = hours + ":" + minutes + AmOrPm;
            }
        }//end for


        //for multi day events we must check wether or not it spans multiple months
        if (startMonth != endMonth) {
            spanDateStr = startMonth + " " + startDay + ` ${finalStartTime}` + " - " + endMonth + " " + endDay + " " + finalEndTime
        }

        //same month and day event
        else if (startMonth == startMonth && startDay == endDay) {
            spanDateStr = startMonth + " " + startDay + ` ${finalStartTime}` + ` - ${finalEndTime}`
        }

        //same month different day event
        else {
            spanDateStr = startMonth + " " + startDay + ` ${finalStartTime}` + " - " + endDay + ` ${finalEndTime}`
        }
    }//end else

    return spanDateStr
}//end func

//PARAMETERS: str: parses day # out of formatted str ex. "May 9, 2024"
//RETURN: returns day # as str
//function to parse day from date string in format "May 9, 2024"
function parseDay(str) {
    const regex = /\b\d{1,2}\b/; //searches for one or two numbers surrounded by word boundaries ie " " and "," for our use case
    //ex "May 25, 2024"

    var tokens = regex.exec(str)
    if (tokens[0] != null) {
        var elem = tokens[0]
        return elem
    }
    else {
        console.log("Error Parsing string day: function parseDay(str)")
        return -1
    }

}
//PARAMETERS: str: parses month word out of formatted str ex. "May 9, 2024"
//RETURN: returns month str as str ex. "May"
//function to parse month from date string in format "May 9, 2024"
function parseMonth(str) {
    // Define the regex pattern to match the month part of the date string
    const monthPattern = /^[A-Za-z]+/;
    // Apply the regex pattern to the input date string
    const tokens = monthPattern.exec(str);
    if (tokens[0] != null) {
        var elem = tokens[0]
        return elem
    }
    else {
        console.log("Error Parsing string month: function parseMonth(str)")
        return -1
    }
}
//PARAMETERS: str: parses year # out of formatted str ex. "May 9, 2024"
//RETURN: returns year # as str ex. "2024"
//function to parse year from date string in format "May 9, 2024"
function parseYear(str) {
    const yearPattern = /\b\d{4}\b/;

    // Apply the regex pattern to the input date string
    const tokens = yearPattern.exec(str);
    if (tokens[0] != null) {
        var elem = tokens[0]
        return elem
    }
    else {
        console.log("Error Parsing string Year: function parseYear(str)")
        return -1
    }
}
//PARAMETERS: str: parses Time # out of formatted str ex. "May 9, 2024 23:59:59"
//RETURN: returns Time # as str ex. "23:59:59"
//function to parse year from date string in format "mmm, dd yyyy TT:TT:TT"
function parseTime(str) {
    if (str === null || str === "") {
        //the event had no time
        return ""
    }
    const regex = /\b(\d{2}:\d{2}:\d{2})\b/;
    const token = regex.exec(str)

    if (token) {
        return token[0]
    }
    else {
        //error parsing the time from passed string
        console.log("Error Parsing string Time: function parseTime(str)")
        return -1
    }
}

//PARAMS: pass function string in date format yyyy-mm-dd and specify which element you want parsed by setting that bool true, and others false
//RETURN: Returns specified digits (int) from string in format 2024-6-21 yyyy-mm-dd
function parseDayBoxIdDate(str, boolYear = false, boolMonth = false, boolDay = false) {

    const regex = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
    const tokens = regex.exec(str)

    if (tokens) {
        if (boolYear === true && boolMonth === false && boolDay === false) {
            return parseInt(tokens[1])
        }
        else if (boolMonth === true && boolYear === false && boolDay === false) {
            return parseInt(tokens[2])
        }
        else if (boolDay === true && boolYear === false && boolMonth == false) {
            return parseInt(tokens[3])
        }
        else {
            console.log("Error function parseDayBoxIdDate: Incorrect usage of bool parameters")
        }
    } else {
        console.log("Error function parseDayBoxIdDate: no tokens extracted from passed string");
    }
}//end function

//takes cms string format "May, 9 2024" and reformats to "2024-5-9"
//This format is used as ID for each grid box of the month view so we can id each day
function assembleMonthViewDateStr(str) {
    let day = parseDay(str)
    let month = parseMonth(str)
    month = months.indexOf(month) + 1
    let year = parseYear(str)
    let finalStr = year + "-" + month + "-" + day
    return finalStr
}

//Heap sort takes in an array and sorts the array by starting date
//passed array of task class objects, and returns a sorted array of those objects
//Upper Bounded Runtime: O(n^2) (due to bubble sort same day case)
function heapSort(eventsArr) {
    /** Create a heap from an array of objects */
    var list = [];
    for (let i = 0; i < eventsArr.length; i++) {
        if (list.length == 0) {
            //insert root node
            list.push(eventsArr[0]);
        }
        else {
            //add new object and heapify array
            list.push(eventsArr[i]);
            for (let childInd = list.length - 1; childInd >= 1; childInd--) //heapify
            {
                var parentInd = Math.floor((childInd - 1) / 2);

                //if parent is greater than child, swap
                //need to fetch date content here
                if (Date.parse(list[parentInd].getDate()) > Date.parse(list[childInd].getDate())) {
                    //swap parent and child node
                    var childElem = list.splice(childInd, 1, list[parentInd])[0]
                    list[parentInd] = childElem
                }
            }
        }//end else
    }//end for loop

    /** Continuously Remove the root from the Minheap to sort it*/
    var sortedList = []  //sorted list is the final sorted list after removing all elemtents from list
    var eventKey = 100 //this is the event key, it's used to differentiate tasks even if they have the exact same elements
    while (list.length != 0) {
        //removes from top
        var root = list.shift()
        root.setKey(eventKey)
        sortedList.push(root)
        eventKey++

        //now check if list is empty bc we cannot heapify an empty list
        if (list.length == 0) {
            break;
        }

        //add last element to the first index
        var last = list.pop();
        list.unshift(last)

        //heapify the rest of the array
        for (let childInd = list.length - 1; childInd >= 1; childInd--) //heapify
        {
            var parentInd = Math.floor((childInd - 1) / 2);

            //if parent is greater than child, swap
            //need to fetch date content here
            if (Date.parse(list[parentInd].getDate()) > Date.parse(list[childInd].getDate())) {
                //swap parent and child node            
                var childElem = list.splice(childInd, 1, list[parentInd])[0]
                list[parentInd] = childElem
            }
        }//end for
    }//end while

    //sort same starting day events in order (Bubble Sort)
    for (let i = 0; i < sortedList.length; i++) {
        for (let childInd = 0; childInd < sortedList.length - i - 1; childInd++) {
            //for correct array order when placing events
            //edge case to place varying length events that start on same day in decending order of banner length by days
            if (Date.parse(sortedList[childInd + 1].getDate()) === Date.parse(sortedList[childInd].getDate())) {
                if (Math.abs(Date.parse(sortedList[childInd].getDate()) - Date.parse(sortedList[childInd].getEndDate())) < Math.abs(Date.parse(sortedList[childInd + 1].getDate()) - Date.parse(sortedList[childInd + 1].getEndDate()))) {
                    //swap parent and child node
                    var childElem = sortedList.splice(childInd + 1, 1, sortedList[childInd])[0]
                    sortedList[childInd] = childElem
                }
            }
        }
    }


    return sortedList;
}//end heapsort function

//PARAMS: Tasks arr, year, month
//RETURN: none
//Function takes currentYear, and currentMonth and calculates how large the grid box should be
//to fit within a 700px container div
function calcGridBoxHeight(year, month) {
    let numrows = getTotalDays(year, month + 1) / 7 //numrows will always be divisible by 7
    if (document.getElementsByClassName('calendar-day')[0] != null) {
        let boxDivs = document.getElementsByClassName('calendar-day')
        for (let i = 0; i < boxDivs.length; i++) {
            boxDivs[i].style.height = `${700 / numrows}px` //this calculates the height for our day grid box
        }
    }
    else {
        console.log("error: finding calendar-day div for height calculation")
    }
}//end function calcGridBoxHeight

function calcBannerWidthResize() {
    let banners = document.getElementsByClassName("task")
    if (banners.length == 0) {
        return //there are no banners to be resized
    }
    var gridBoxW = document.getElementsByClassName("calendar-day")[0].offsetWidth
    var viewPortW = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)

    for (let i = 0; i < banners.length; i++) {
        let classList = banners[i].classList
        let numDays = parseInt(classList[1])
        //var width = Math.floor(((gridBoxW/viewPortW)*numDays - 40/viewPortW)*100) //calculates how many days the banner should span across - 40px padding to grid box
        var width = gridBoxW * numDays - 10 //width of one grid box - 10px padding
        banners[i].style.cssText = `width: ${width}px;` //sets banner width according to viewport size
    }
}

function calcBannerWidth(banner, numDays) {
    var gridBoxW = document.getElementsByClassName("calendar-day")[0].offsetWidth  //was .clientWidth
    var viewPortW = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    //var width = Math.floor(((gridBoxW/viewPortW)*numDays - 10/viewPortW)*100) //calculates how many days the banner should span across - 30px padding to grid box
    var width = gridBoxW * numDays - 10 //width of one grid box - 10px padding
    banner.style.cssText = `width: ${width}px;` //sets banner width according to viewport size
    banner.classList.add(`${numDays}`)//adding num days of event to banner classList for future use
}

//page listener for window Resize
window.addEventListener('resize', calcBannerWidthResize, false)
