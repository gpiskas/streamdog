// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rdev::{Event, EventType, Key};
use tauri::{AppHandle, Emitter, Manager};

#[tauri::command]
fn get_display_size() -> (u64, u64) {
    return rdev::display_size().unwrap();
}

fn get_callback(app: AppHandle) -> impl FnMut(Event) {
    return move |event: Event| match event.event_type {
        EventType::MouseMove { x, y } => {
            app.emit("MouseMove", [x, y]).unwrap();
        }
        EventType::KeyPress(key) => {
            app.emit("KeyPress", get_key_press_payload(key, event))
                .unwrap();
        }
        EventType::KeyRelease(key) => {
            app.emit("KeyRelease", get_key_press_payload(key, event))
                .unwrap();
        }
        EventType::ButtonPress(_button) => {
            app.emit("ButtonPress", true).unwrap();
        }
        EventType::ButtonRelease(_button) => {
            app.emit("ButtonRelease", true).unwrap();
        }
        _ => {}
    };
}

fn get_key_press_payload(key: Key, event: Event) -> (String, String) {
    match event.name {
        Some(name) => (format!("{:?}", key), name),
        None => (format!("{:?}", key), "".to_owned()),
    }
}

fn spawn_event_listener(app: AppHandle) {
    tauri::async_runtime::spawn(async { rdev::listen(get_callback(app)).unwrap() });
}

fn main() {
    tauri::Builder::default()
        .device_event_filter(tauri::DeviceEventFilter::Always)
        .setup(|app| {
            spawn_event_listener(app.app_handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_display_size])
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
