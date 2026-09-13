<?php
/**
 * Database Connection using PDO
 * Connects securely using credentials defined in .env
 */

require_once __DIR__ . '/env.php';

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): ?PDO {
        if (self::$instance === null) {
            $host = env('DB_HOST', 'localhost');
            $db   = env('DB_NAME', '');
            $user = env('DB_USER', '');
            $pass = env('DB_PASS', '');
            $charset = 'utf8mb4';

            if (empty($db) || empty($user)) {
                // If database credentials not yet configured
                return null;
            }

            $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];

            try {
                self::$instance = new PDO($dsn, $user, $pass, $options);
            } catch (PDOException $e) {
                $isDebug = env('APP_DEBUG', 'false') === 'true';
                if ($isDebug) {
                    error_log("[Database Connection Error]: " . $e->getMessage());
                } else {
                    error_log("[Database Connection Error]: Connection failed.");
                }
                return null;
            }
        }
        return self::$instance;
    }
}

/**
 * Shorthand helper to retrieve active PDO connection
 */
function get_db(): ?PDO {
    return Database::getConnection();
}
