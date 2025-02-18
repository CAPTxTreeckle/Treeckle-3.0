import requests;
import datetime;
import json;

def getTimings(SemStartDate, filtered_timetable):
    daysadded = {'Monday': 0, 'Tuesday':1, 'Wednesday':2, 'Thursday': 3, 'Friday': 4}
    timetable = []
    seen_sessions = set()

    for classes in filtered_timetable:
        starttime = datetime.datetime.strptime(classes['start_time'], "%H%M").time()
        endtime = datetime.datetime.strptime(classes['end_time'], "%H%M").time()
        day = classes['day']

        for week in classes['weeks']:
            try:
                week = int(week)
            except ValueError:
                break
            classdate = SemStartDate + datetime.timedelta(daysadded[day], 0,0,0,0,0, week - 1 if week < 6 else week) #to account for recess week
            session_key = (classdate, starttime)
            if session_key not in seen_sessions:
                seen_sessions.add(session_key)
                start_date_time = datetime.datetime.combine(classdate, starttime).timestamp() #I think they are using unix timestamps(?)
                end_date_time = datetime.datetime.combine(classdate, endtime).timestamp()
                timetable.append({
                    "start_time": start_date_time,
                    "end_time": end_date_time,
                    "venue": classes.get('venue')
                })
    return timetable
        

result = []
capt_mods = ['UTC1402', 'UTC1403', 'UTC1404', 'UTC1409', 'UTC1415', 'UTC1416', 'UTC1417', 'UTC1419', 'UTC1420', 'UTC1421', 'UTC1422',
             'UTC2400', 'UTS2414', 'UTC2403', 'UTS2403', 'UTC2404', 'UTC2406', 'UTS2404', 'UTC2407', 'UTS2405', 'UTC2408', 'UTS2406',
             'UTC2409', 'UTS2407', 'UTC2410A', 'UTC2410B', 'UTC2411', 'UTS2408', 'UTC2412', 'UTS2409', 'UTC2413', 'UTS2416', 'UTC2414',
             'UTC2414', 'UTC2415', 'UTS2415', 'UTC2416', 'UTS2411', 'UTC2418', 'UTS2412', 'UTC2419', 'UTS2413', 'UTC2420A', 'UTC2420B', 
             'UTS2400', 'UTC2417', 'UTS2402', 'UTC2402', 'UTW1001C', 'UTW1001G', 'UTW1001I', 'UTW1001J', 'UTW1001K', 'UTW1001P', 'UTW1001T',
             'UTW1001X']
for mod in capt_mods:
    details = requests.get(f"https://api.nusmods.com/v2/2024-2025/modules/{mod}.json")
    module_data = details.json()
    
    for semester in module_data.get("semesterData"):
        timetable = semester.get("timetable", [])
        filtered_timetable = [
            {
                'module_code': module_data['moduleCode'],
                'semester' : semester['semester'],
                'start_time': entry.get('start_time', entry.get('startTime')),
                'end_time': entry.get('end_time', entry.get('endTime')),
                'weeks': entry['weeks'],
                'venue': entry['venue'],
                'day' : entry['day']
            }
            for entry in timetable if 'CAPT' in entry.get('venue', '')
        ]

        if filtered_timetable!= []: #venue is capt
            intsem = filtered_timetable[0]['semester']
            SemStartDate = { 1: datetime.date(2024, 8, 5), 2 : datetime.date(2025, 1, 13), 3 : datetime.date(2025, 5, 12) }
            cleanedTimetable = getTimings(SemStartDate[filtered_timetable[0]['semester']], filtered_timetable) #sem 1 or 2 class's datetime ranges (start n end datetime)

            if cleanedTimetable != []:
                result.append({"module_code": mod,"semester": intsem, "timetable": cleanedTimetable})

print(result)

#with open('timetable_data.json', 'w') as json_file: json.dump(result, json_file, indent=4)

    
    # modules = requests.get("https://api.nusmods.com/v2/2024-2025/moduleList.json")
    # venues = requests.get("https://api.nusmods.com/v2/2024-2025/semesters/2/venues.json")

    # print(modules.json())
    # print(venues.json())
