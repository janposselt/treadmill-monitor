# Treadmill-Monitor

An implementation using Web Bluetooth and FTMS to control a treadmill from a browser.

# Disclaimer

This script is under development and should be used with care. Malfunctions and bugs may result in unexpected behavior of your treadmill. Make sure that you understand the risks and use the safety equipment.

# Description

This website displays some basic activity information of a connected treadmill. Furthermore, it allows the athlete to perform heart rate-based training by automatically adjusting the speed when the heart rate falls below or rises above a user-defined limit.

# Requirements

- A treadmill with Bluetooth and FTMS (e.g., the Decathlon Domyos T900D)
- To use heart rate-controlled speed adjustment, your treadmill MUST receive heart rate data (e.g., by using a compatible pulse belt)
- A web browser that supports the Web Bluetooth API. On iPhones, you can use Bluefy.

# How to Start

A ready-to-use version is located [here](https://ichbinlaufen.de/laufband/hr-training.html).

To host it by yourself, clone the repository and serve the files on localhost. When serving the site from any other domain, using HTTPS is required due to security policies. Make sure to use a device that has Bluetooth enabled and a compatible browser. Turn on your treadmill and ensure it is accepting Bluetooth connections. Click "Connect" and select your treadmill from the list. The heart rate monitor is now ready to show live data from your treadmill. To use the heart rate-controlled speed feature, set your target heart rate by clicking "Set Target HR". To activate the speed adjustment, click "Start HR Training".
