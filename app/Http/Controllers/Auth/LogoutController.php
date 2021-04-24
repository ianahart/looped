<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Tymon\JWTAuth\Facades\JWTAuth;

class LogoutController extends Controller
{

    /*
     * Logout user and invalidate token
     * @param Request $request
     * @return JsonResponse
     */


    public function store(Request $request)
    {

        $header = $request->header('Authorization');

        $token = str_replace('Bearer ', '', $header);

        JWTAuth::setToken($token)->invalidate();

        $this->updateIsLoggedIn();

        return response()->json(
            [
                'logout' => true
            ],
            200
        );
    }

    /*
     * update is_logged_in column to false
     * @param void
     * @return void
     */


    private function updateIsLoggedIn()
    {

        User::where('id', '=', JWTAuth::user()->id)
            ->update(
                [
                    'is_logged_in' => false
                ]
            );
    }
}
