"use client";

import React, { useState } from "react";
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import { UserAuth } from "../context/AuthContext";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];



export default function CreateLog() {
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState(""); // not implemented yet
    const [datetime, changeDatetime] = useState<Value>(new Date());
    const [isLoading,setLoading] = useState(false); // for when the form is submitted
    const [tags, setTags] = useState(['other']);

    const { user, googleSignIn, logOut } = UserAuth();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const ticket = {
            datetime, duration, description, tags,
        }
    }

    return (
        <form className="w-screen flex border border-solid border-grey">
            
            <label>
                <span>Date and time:</span>
                <DateTimePicker onChange={changeDatetime} value={datetime} autoFocus={true}/>
            </label> 
            <label>
                <span>Duration (minutes):</span>
                <textarea 
                    className="border border-solid border-grey"
                    required
                    onChange={(e) => setDuration(e.target.value)} // does not currently check for input type
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
                    <option value="meditation">Meditation</option>
                    <option value="studying">Studying</option>
                    <option value="other">Other</option>
                </select>
            </label>

            <button 
                className="p-4 border border-solid border-grey" 
                disabled={isLoading}
                type="button"
            >
                {isLoading && <span>Adding to log!</span>}
                {!isLoading && <span>Submit</span>}
            </button>
        </form>
    );
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