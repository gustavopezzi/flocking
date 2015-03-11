$(document).ready(function() {
    var canvas = document.getElementById('canvas');
    var c = canvas.getContext('2d');

    // set canvas to full screen size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    console.log(canvas.width);
    console.log(canvas.width);

    function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function point(x, y) {
        c.fillStyle = '#fff';
        c.fillRect(x-1, y-1, 2, 2);
    }

    function line(x1, y1, x2, y2) {
        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x2, y2);
        c.lineWidth = 3;
        c.strokeStyle = getRandomColor();
        c.stroke();
    }

    function clear() {
        c.clearRect(0, 0, canvas.width, canvas.height);
    }

    function Thing() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.dir = Math.random() * Math.PI;
        this.last_dir = this.dir;
        this.speed = 1;
    }

    things = [];
    for (var i = 0; i < 256; i++) {
        things.push(new Thing());
    }

    function distance2(x1, y1, x2, y2) {
        return Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2);
    }

    function sorted_dist(t) {
        ts = [];
        for (var i = 0, t2; t2 = things[i++]; i++) {    
            ts.push({ t: t2, d: distance2(t.x, t.y, t2.x, t2.y)});
        }
        
        return ts.sort(function(a, b) {
            return a.d - b.d;
        });
    }

    function avg_heading(ts) {
        var avg = 0;
        var c = 0;
        for (var i = 0; i < ts.length; i++) {
            t = ts[i];
            if (t.d > 64 * 64) {
                continue;
            } 
            else {
                c += 1
            }
            avg += t.t.dir;
        }
        return avg / (c == 0 ? 1 : c);
    }

    function avg_position(ts) {
        var x = 0;
        var y = 0;
        var c = 0;
        for (var i = 0; i < ts.length; i++) {
            t = ts[i];
            // console.log(t.d);
            if (t.d > 256*256) {
                continue;
            }
            else {
                c += 1;
            }
            
            x += t.t.x;
            y += t.t.y;
        }
        return {x: x/(c == 0 ? 1 : c), y: y/(c == 0 ? 1 : c)};
    }

    function pos_dir(t, x, y) {
        return ((Math.atan2(t.x - x, t.y - y) + Math.PI) - t.dir) % (2 * Math.PI);
    }

    function update() {
        for (var i = 0, t; t = things[i++]; i++) {
            t.x += Math.sin(t.dir) * t.speed;
            t.y += Math.cos(t.dir) * t.speed;

            if (t.x < 0) t.x = canvas.width;
            if (t.y < 0) t.y = canvas.height;
            if (t.x > canvas.width) t.x = 0;
            if (t.y > canvas.height) t.y = 0;
            
            neigh = sorted_dist(t);
            avg_head = avg_heading(neigh);
            avg_pos = avg_position(neigh);
            dif_dir = pos_dir(t, avg_pos.x, avg_pos.y);
            
            var dir_change = 0;
            var head_dif = (t.dir - avg_head) % (2 * Math.PI);
            var pos_dif = (t.dir - dif_dir) % (2 * Math.PI);
            
            if (Math.abs(head_dif) > 0.15) {
                if (avg_head > t.dir) {
                    dir_change += 0.05;
                }
                else if (avg_head < t.dir) {
                    dir_change -= 0.05;
                }
            }
            
            if (Math.abs(pos_dif) > 0.15) {
                if (dif_dir > t.dir) {
                    dir_change += 0.05;
                }
                else if (dif_dir < t.dir) {
                    dir_change -= 0.05;
                }
            }
            
            t.last_dir = t.dir;
            t.dir += dir_change;
            t.speed = 3 - (Math.abs(dir_change / 0.2)*2);
            // t.speed = 4;
            
            t.dir = t.dir % (2 * Math.PI);
        }
    }

    function render() {
        clear();
        for (var i = 0, t; t = things[i++]; i++) {
            point(t.x, t.y);
            
            var lx = t.x - (Math.sin(t.dir) * 8);
            var ly = t.y - (Math.cos(t.dir) * 8);
            line(t.x, t.y, lx, ly);
            
            var lx2 = lx - (Math.sin(t.last_dir) * 8);
            var ly2 = ly - (Math.cos(t.last_dir) * 8);
            line(lx, ly, lx2, ly2);
        }
    }

    function loop() {
        update();
        render();
    }

    setInterval(loop, Math.floor(1000/60));

});