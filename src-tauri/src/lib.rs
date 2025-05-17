use tauri::{
    menu::{ Menu, MenuItem },
    tray::{ MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent },
    Listener,
    Manager,
};
use tauri_plugin_positioner::Position;
use tauri_plugin_positioner::WindowExt;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder
        ::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_positioner::init())
        .setup(|app| {
            // Add window event handler
            let handle = app.handle().clone();
            let window = handle.get_webview_window("main").unwrap();
            window.listen("tauri://blur", move |_| {
                let window = handle.get_webview_window("main").unwrap();
                let _ = window.hide();
            });
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit_i])?;
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .on_tray_icon_event(|tray_handle, event| {
                    tauri_plugin_positioner::on_tray_event(tray_handle.app_handle(), &event);

                    if
                        let TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            ..
                        } = event
                    {
                        let webview = tray_handle.app_handle().get_webview_window("main");
                        let window = webview.as_ref().unwrap();

                        if !window.is_visible().unwrap() {
                            let _ = window.move_window(Position::TrayBottomCenter);
                            let _ = window.show();
                            let _ = window.set_focus();
                        } else {
                            let _ = window.move_window(Position::TrayBottomCenter);
                            let _ = window.hide();
                        }
                    }
                })
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| {
                    match event.id.as_ref() {
                        "quit" => {
                            println!("quit menu item was clicked");
                            app.exit(0);
                        }
                        _ => {
                            println!("menu item {:?} not handled", event.id);
                        }
                    }
                })
                .build(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
