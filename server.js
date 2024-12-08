const http = require('http');
const fs = require('fs');
const url = require('url');

// Fungsi untuk membaca file komentar
function readComments() {
    return new Promise((resolve, reject) => {
        fs.readFile('comments.json', 'utf8', (err, data) => {
            if (err) reject(err);
            resolve(JSON.parse(data));
        });
    });
}

// Fungsi untuk menulis komentar ke file
function writeComments(comments) {
    return new Promise((resolve, reject) => {
        fs.writeFile('comments.json', JSON.stringify(comments, null, 2), 'utf8', (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}

// Membuat server
const server = http.createServer(async (req, res) => {
    // Menambahkan header CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const reqUrl = url.parse(req.url, true);
    const method = req.method;

    // Menangani permintaan untuk menghapus komentar berdasarkan ID
    if (reqUrl.pathname.startsWith('/comments/') && method === 'DELETE') {
        const id = reqUrl.pathname.split('/')[2];
        console.log(`Received DELETE request for ID: ${id}`);
        try {
            const comments = await readComments();
            const filteredComments = comments.filter(comment => comment.id !== id);

            if (comments.length === filteredComments.length) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Comment not found' }));
                return;
            }

            await writeComments(filteredComments);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Comment deleted successfully' }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to delete comment' }));
        }
    } else if (reqUrl.pathname === '/comments' && method === 'GET') {
        try {
            const commentsData = await readComments();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(commentsData));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to load comments' }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

// Menjalankan server pada port 5000
server.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});