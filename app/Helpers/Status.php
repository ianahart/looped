<?php


namespace App\Helpers;

use Tymon\JWTAuth\Facades\JWTAuth;
use App\Events\UserStatusChanged;
use App\Models\User;
use Exception;

class Status
{
  public ?string $currentUserId;
  public string $exception = '';
  public string $userStatus = '';

  public function __construct($currentUserId = null)
  {
    $this->currentUserId = $currentUserId;
  }

  public function getUserStatus()
  {
    return $this->userStatus;
  }

  public function checkToken(string $token): bool
  {
    if (isset($token)) {
      $userId = JWTAuth::setToken($token)->getPayload()['user_id'];
    }

    if (JWTAuth::user()->id) {
      return intval($userId) === intval(JWTAuth::user()->id) ? true : false;
    }
  }

  public function getException()
  {

    return $this->exception ? $this->exception : '';
  }

  /*
  * update authentication column
  * @param bool $authStatus
  * @param string $userStatus
  * @return void
  */

  public function updateStatus(bool $authStatus, string $userStatus)
  {

    try {

      $user =  User::where('id', '=', $this->currentUserId)
        ->first();

      $user->is_logged_in = $authStatus;
      $user->status = $userStatus;

      $user->save();
      $user->refresh();

      broadcast(new UserStatusChanged($user));

      $this->userStatus = $userStatus;
    } catch (Exception $e) {
      $this->exception = $e->getMessage();
    }
  }
}
