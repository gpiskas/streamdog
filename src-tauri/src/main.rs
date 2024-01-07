// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rdev::{Event, EventType};
use tauri::{AppHandle, Manager};

#[tauri::command]
fn get_display_size() -> (u64, u64) {
    return rdev::display_size().unwrap();
}

fn get_callback(app: AppHandle) -> impl FnMut(Event) {
    return move |event: Event| {
        // println!("My callback {:?}", app);
        match event.event_type {
            EventType::MouseMove { x, y } => {
                app.emit_all("MouseMove", [x, y]).unwrap();
            }
            EventType::KeyPress(_key) => {
                app.emit_all("KeyPress", event.name).unwrap();
            }
            EventType::KeyRelease(_key) => {
                app.emit_all("KeyRelease", event.name).unwrap();
            }
            EventType::ButtonPress(_button) => {
                app.emit_all("ButtonPress", true).unwrap();
            }
            EventType::ButtonRelease(_button) => {
                app.emit_all("ButtonRelease", true).unwrap();
            }
            _ => {}
        }
    };
}

fn spawn_event_listener(app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        if let Err(error) = rdev::listen(get_callback(app)) {
            println!("Error: {:?}", error)
        }
    });
}

fn main() {
    tauri::Builder::default()
        .device_event_filter(tauri::DeviceEventFilter::Always)
        .setup(|app| {
            spawn_event_listener(app.app_handle());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_display_size])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
