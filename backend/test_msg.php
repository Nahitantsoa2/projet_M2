<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $msg = App\Models\Message::create([
        'contenu' => 'test message',
        'expediteur' => 'utilisateur',
        'id_conversation' => 1
    ]);
    echo "Message created: " . $msg->id_message;
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
