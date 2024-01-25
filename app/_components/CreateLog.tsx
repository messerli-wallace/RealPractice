"use client";

import { useState } from "react";
import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import { UserAuth } from "../context/AuthContext";
import { addLog } from "../_db/db.js"; 


// Typescript declarations for the date-time component in the log form
type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function CreateLog() {
    // https://youtu.be/nSfu7sHPE9M?si=vBRp3uHl2pKxk0ZI
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState(""); // not implemented yet
    const [datetime, changeDatetime] = useState<Value>(new Date());
    const [isLoading,setLoading] = useState(false); // for when the form is submitted
    const [tags, setTags] = useState(["other"]);
    const { user } = UserAuth();

    const handleSubmit = async (e) => {
        e.preventDefault(); // prevents refresh after submissions
        setLoading(true);   // stops user from inputting another log when current log is being processed

        const dateTimeStr = datetimeToString(datetime);
        const ticket = {
            dateTimeStr, duration, description, tags
        }
        //try logging
        try {
            const logPath = user.uid;
            await addLog(
            logPath, ticket); //writes the log ticket

          } catch (error) {
            console.error('Error writing data:', error);
          }
        setLoading(false);
    }

    const handleChangeDuration = (e) => {
        // https://stackoverflow.com/questions/43067719/how-to-allow-only-numbers-in-textbox-in-reactjs#:~:text=Basic%20idea%20is%3A,value%20is%20a%20valid%20number.
        const re = /^[0-9\b]+$/; //regex

        //if the value isn't blank, check the input against the regex
        if (e === '' || re.test(e)) {
            setDuration(e);
        }
    };

    return (
        <div className="p-4">
        <h1 className="text-2xl">New Log</h1>
        {user ? (
        <form onSubmit={handleSubmit} id="createLog" className="w-screen flex border border-solid border-grey">
            
            <label>
                <span>Date and time:</span>
                <DateTimePicker 
                onChange={changeDatetime} 
                value={datetime} 
                autoFocus={true}
                />
            </label> 
            <label>
                <span>Duration (minutes):</span>
                <textarea 
                    className="border border-solid border-grey"
                    required
                    onChange={(e) => handleChangeDuration(e.target.value)} 
                    value={duration}
                    cols={4}
                />
            </label>
            
            <label>
                <span>Description:</span>
                <textarea 
                className="border border-solid border-grey"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                cols={60}
                />
            </label>
            <label>
                <span>Tags:</span>
                <select
                    // https://react.dev/reference/react-dom/components/select 
                    className="border border-solid border-grey"
                    multiple={true}
                    value={tags}
                    onChange={e => {
                        const options = [...e.target.selectedOptions];
                        const values = options.map(option => option.value);
                        setTags(values);
                    }}
                >
                    <option value="music">Music</option>
                    <option value="piano">Piano</option>
                    <option value="meditation">Meditation</option>
                    <option value="studying">Studying</option>
                    <option value="other">Other</option>
                </select>
            </label>

            <button 
                className="p-4 border border-solid border-grey" 
                disabled={isLoading}
                type="submit"
            >
                {isLoading && <span>Adding to log!</span>}
                {!isLoading && <span>Submit</span>}
            </button>
        </form>
        ) : ( 
        <div className="p-4">
        You must be logged in to add a log.
        </div>
        )}
        </div>
    ); 
}

function datetimeToString(datetime) {
    /* 
    returns a date-time object to a string in the format {MM}-{DD}-{YYYY}-{HH}-{MM}-GMT-{N} 
    */
    //Specify the options for the output format
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'shortOffset',
        hour12: false
    } as Intl.DateTimeFormatOptions;
    const str_date = datetime?.toLocaleString([],options);
    const arrDT = str_date?.split(/[\s:,/]+/); //split on all the separating characters
    // format ['MM', 'DD', 'YYYY', 'HH', 'MM', 'GMT-6']
    const outDT = arrDT?.join('-');
    return outDT;
}

// Define the interfaces for the tag option object, needed in TypeScript implementation that currently isn't being used
// interface Option {
//     value: string;
//     label: string;
//   }
// const tagOptions: Option[] = [
// { value: "music", label: "Music" },
// { value: "meditation", label: "Meditation" },
// { value: "studying", label: "Studying" },
// { value: "other", label: "Other"},
// ];