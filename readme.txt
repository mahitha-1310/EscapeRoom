Escape Room Game (Simple)

How to run:
1) Open Terminal
2) Go to this folder:
   cd "/Users/mahitharammohan/Desktop/User Interface"
3) Start server:
   python3 -m http.server 8081
4) Open browser:
   http://localhost:8081

How to play:
- Click objects to interact
- Click an item in inventory to select it
- Click a target object to use selected item
- Click selected item again to deselect
- Use Drop zone to drop selected item

If server says "Address already in use":
- Try another port, for example:
  python3 -m http.server 8082
