<?php

function encodeItemsToUtf8(&$item, $key) {
	$item = utf8_encode($item);
}

/**
 * Maneja la conección con la Base de Datos
 **/
class DBConnection {
	
	private $connection;

	function __construct($xmlConfigFile) {
		$xml = simplexml_load_file($xmlConfigFile);
		$children = $xml->appsettings->children();
		$this->connection = new mysqli($children->servername, $children->username, $children->password, $children->database, (int)$children->serverport);
		$this->checkForConnectionError();
	}

	private function checkForConnectionError() {
		$error = $this->connection->connect_error;
		if ($error) {
			throw new Exception($error);
		}
	}

	public function query($query) {
		$result = $this->connection->multi_query($query);
		if (!$result) {
			throw new Exception("Error to '$query': " . $this->connection->error);
		}
		return $this->connection->store_result();
		return $result;
	}

	public function resultsetToArray($result) {
		$ret = array();
		if (gettype($result) != "boolean") {
			while ($row = $result->fetch_assoc()) {
				array_push($ret, $row);
			}
			array_walk_recursive($ret, 'encodeItemsToUtf8');
			$result->free();
		}
		return $ret;
	}
	
	public function getAffectedRows() {
		return $this->connection->affected_rows;
	}

	public function escapeString($str) {
		return $this->connection->real_escape_string($str);
	}

	public function close() {
		$this->connection->close();
	}
}

?>
