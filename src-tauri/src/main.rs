// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rdev::{listen, Event};
use tauri::{AppHandle, Manager};

fn get_callback(app: AppHandle) -> impl FnMut(Event) {
    let callback = move |event: Event| {
        // println!("My callback {:?}", app);
        match event.event_type {
            rdev::EventType::MouseMove { x, y } => {
                app.emit_all("MouseMove", [x, y]).unwrap();
            }
            rdev::EventType::KeyPress(key) => {
                let key_str = format!("{:?}", key);
                app.emit_all("KeyPress", key_str).unwrap();
            }
            rdev::EventType::KeyRelease(_key) => {
                app.emit_all("KeyRelease", true).unwrap();
            }
            rdev::EventType::ButtonPress(_button) => {
                app.emit_all("ButtonPress", true).unwrap();
            }
            rdev::EventType::ButtonRelease(_button) => {
                app.emit_all("ButtonRelease", true).unwrap();
            }
            _ => {}
        }
    };
    callback
}

fn spawn_event_listener(app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        if let Err(error) = listen(get_callback(app)) {
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
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
