import tkinter as tk
import time

class TimerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Simple Timer")
        self.root.geometry("200x150")
        self.root.configure(bg='black')

        self.time_var = tk.StringVar()
        self.time_var.set("00:00:00")

        self.label = tk.Label(root, textvariable=self.time_var, font=("Helvetica", 24), bg='black', fg='green')
        self.label.pack(pady=(10, 5))

        self.start_time = None
        self.running = False

        self.button_frame = tk.Frame(root, bg='black')
        self.button_frame.pack(pady=(5, 10))

        self.start_button = tk.Button(self.button_frame, text="Start", command=self.start_timer, bg='gray', fg='white')
        self.start_button.pack(side=tk.LEFT, padx=5)

        self.reset_button = tk.Button(self.button_frame, text="Reset", command=self.reset_timer, bg='gray', fg='white')
        self.reset_button.pack(side=tk.LEFT, padx=5)

        self.exit_button = tk.Button(self.button_frame, text="Exit", command=root.quit, bg='gray', fg='white')
        self.exit_button.pack(side=tk.LEFT, padx=5)

    def start_timer(self):
        if not self.running:
            self.start_time = time.time()
            self.running = True
            self.update_timer()

    def update_timer(self):
        if self.running:
            elapsed_time = time.time() - self.start_time
            hours, remainder = divmod(int(elapsed_time), 3600)
            minutes, seconds = divmod(remainder, 60)
            self.time_var.set(f"{hours:02}:{minutes:02}:{seconds:02}")
            self.root.after(1000, self.update_timer)

    def reset_timer(self):
        self.running = False
        self.time_var.set("00:00:00")

if __name__ == "__main__":
    root = tk.Tk()
    app = TimerApp(root)
    root.mainloop()